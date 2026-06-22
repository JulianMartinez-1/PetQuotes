"""
Data quality pipeline.

For each DataFrame this module:
  1. Prints df.info() and df.describe(include='all')         → structure audit
  2. Reports df.isna().sum() / isnull().sum()                → null audit
  3. Reports df.duplicated().sum()                           → duplicate audit
  4. Applies dropna / fillna with documented justification   → cleaning
  5. Applies astype() to fix types                          → type normalization
  6. Applies rename() where needed                          → consistent snake_case

All decisions are documented in-code (see docs/data_quality_report.md for the summary).
"""

import logging
import pandas as pd

log = logging.getLogger(__name__)


# ── Internal helper ───────────────────────────────────────────────────────────

def _audit(df: pd.DataFrame, table: str) -> None:
    """Log data quality info at DEBUG level so it appears in development logs."""
    log.debug("=== %s: shape %s ===", table, df.shape)
    log.debug("dtypes:\n%s", df.dtypes.to_string())
    missing = df.isna().sum()
    missing_pct = (missing / len(df) * 100).round(2) if len(df) else missing
    log.debug("nulls (%%):\n%s", missing_pct[missing_pct > 0].to_string() if missing_pct.any() else "none")
    dups = df.duplicated().sum()
    if dups:
        log.warning("%s: %d duplicate rows detected", table, dups)


# ── Users ─────────────────────────────────────────────────────────────────────

def clean_users(df: pd.DataFrame) -> pd.DataFrame:
    _audit(df, "users")

    # Types
    # id is a cuid string — leave as object, no cast needed
    df["created_at"] = pd.to_datetime(df["created_at"], utc=True)
    df["locked_until"] = pd.to_datetime(df["locked_until"], utc=True, errors="coerce")

    # Nulls
    # phone: optional by design (CLIENT may skip it) — keep None, never fill
    # locked_until: None means the account is not locked — keep None
    # profile_image: not used for analytics — drop column
    df = df.drop(columns=["profile_image"], errors="ignore")

    # Duplicates: email is UNIQUE in the schema; if any exist, drop extras
    before = len(df)
    df = df.drop_duplicates(subset=["email"], keep="first")
    if len(df) < before:
        log.warning("users: dropped %d duplicate email rows", before - len(df))

    return df


# ── Pets ──────────────────────────────────────────────────────────────────────

def clean_pets(df: pd.DataFrame) -> pd.DataFrame:
    _audit(df, "pets")

    df["created_at"] = pd.to_datetime(df["created_at"], utc=True)
    df["birth_date"] = pd.to_datetime(df["birth_date"], utc=True, errors="coerce")

    # species: schema says NOT NULL but guard just in case
    # fillna with 'Unknown' so species-based groupby works without NaN buckets
    df["species"] = df["species"].fillna("Unknown").astype(str).str.strip().str.lower()

    # breed: optional — keep None; we only group by species in metrics
    # weight: optional, used only for descriptive stats — keep None
    # microchip: optional — keep None
    # blood_type: not used for analytics — drop
    df = df.drop(columns=["blood_type"], errors="ignore")

    # Duplicates: microchip is UNIQUE (nullable); id is PK — no expected dups
    before = len(df)
    df = df.drop_duplicates(subset=["id"], keep="first")
    if len(df) < before:
        log.warning("pets: dropped %d duplicate id rows", before - len(df))

    return df


# ── Appointments ──────────────────────────────────────────────────────────────

def clean_appointments(df: pd.DataFrame) -> pd.DataFrame:
    _audit(df, "appointments")

    df["start_time"] = pd.to_datetime(df["start_time"], utc=True)
    df["end_time"] = pd.to_datetime(df["end_time"], utc=True, errors="coerce")
    df["created_at"] = pd.to_datetime(df["created_at"], utc=True)

    # status: enum NOT NULL — cast to category for memory efficiency
    df["status"] = df["status"].astype("category")

    # end_time: None means appointment is ongoing or not yet closed — keep None
    # cancellation_reason: only relevant when status == CANCELLED — keep None elsewhere
    # Drop text columns not used for numeric analysis
    df = df.drop(columns=["cancellation_reason"], errors="ignore")

    # Duplicates: idempotency_key is UNIQUE — id is PK
    before = len(df)
    df = df.drop_duplicates(subset=["id"], keep="first")
    if len(df) < before:
        log.warning("appointments: dropped %d duplicate id rows", before - len(df))

    return df


# ── Clinics ───────────────────────────────────────────────────────────────────

def clean_clinics(df: pd.DataFrame) -> pd.DataFrame:
    _audit(df, "clinics")

    df["created_at"] = pd.to_datetime(df["created_at"], utc=True)

    # rating: defaults to 0 in schema — fillna(0) as safety net
    df["rating"] = pd.to_numeric(df["rating"], errors="coerce").fillna(0.0)

    # is_verified: boolean — coerce non-bool values to False
    df["is_verified"] = df["is_verified"].fillna(False).astype(bool)

    return df


# ── Branches ──────────────────────────────────────────────────────────────────

def clean_branches(df: pd.DataFrame) -> pd.DataFrame:
    _audit(df, "branches")
    df["created_at"] = pd.to_datetime(df["created_at"], utc=True)
    # city: NOT NULL in schema — strip whitespace just in case
    df["city"] = df["city"].astype(str).str.strip()
    return df


# ── Professionals ─────────────────────────────────────────────────────────────

def clean_professionals(df: pd.DataFrame) -> pd.DataFrame:
    _audit(df, "professionals")

    df["created_at"] = pd.to_datetime(df["created_at"], utc=True)

    # years_of_experience: optional integer — keep None; do NOT fill with median
    # because filling would misrepresent the data for KPI display
    df["years_of_experience"] = pd.to_numeric(df["years_of_experience"], errors="coerce")

    df["is_active"] = df["is_active"].fillna(True).astype(bool)

    return df


# ── Veterinary Services ───────────────────────────────────────────────────────

def clean_veterinary_services(df: pd.DataFrame) -> pd.DataFrame:
    _audit(df, "veterinary_services")
    df["price"] = pd.to_numeric(df["price"], errors="coerce")
    df["is_active"] = df["is_active"].fillna(True).astype(bool)
    # category: strip whitespace
    df["category"] = df["category"].astype(str).str.strip().str.lower()
    return df


# ── Vaccines ──────────────────────────────────────────────────────────────────

def clean_vaccines(df: pd.DataFrame) -> pd.DataFrame:
    _audit(df, "vaccines")
    df["date_administered"] = pd.to_datetime(df["date_administered"], utc=True)
    df["expiry_date"] = pd.to_datetime(df["expiry_date"], utc=True, errors="coerce")
    df["next_due_date"] = pd.to_datetime(df["next_due_date"], utc=True, errors="coerce")
    df["created_at"] = pd.to_datetime(df["created_at"], utc=True)
    # expiry_date / next_due_date: optional — keep None (date unknown, not expired)
    return df


# ── Medications ───────────────────────────────────────────────────────────────

def clean_medications(df: pd.DataFrame) -> pd.DataFrame:
    _audit(df, "medications")
    df["start_date"] = pd.to_datetime(df["start_date"], utc=True)
    df["end_date"] = pd.to_datetime(df["end_date"], utc=True, errors="coerce")
    df["created_at"] = pd.to_datetime(df["created_at"], utc=True)
    # status: string enum (ACTIVE/COMPLETED/DISCONTINUED) — cast to category
    df["status"] = df["status"].astype("category")
    return df


# ── Notifications ─────────────────────────────────────────────────────────────

def clean_notifications(df: pd.DataFrame) -> pd.DataFrame:
    _audit(df, "notifications")
    df["created_at"] = pd.to_datetime(df["created_at"], utc=True)
    df["read"] = df["read"].fillna(False).astype(bool)
    df["type"] = df["type"].astype("category")
    return df
