"""
Unit tests for the pipeline layer.
These tests use in-memory DataFrames — no database required.
"""

import pandas as pd
import pytest
from pipeline import cleaners, metrics


# ── Fixtures ─────────────────────────────────────────────────────────────────

@pytest.fixture
def sample_users():
    return pd.DataFrame({
        "id": ["u1", "u2", "u3"],
        "email": ["a@test.com", "b@test.com", "c@test.com"],
        "full_name": ["Alice", "Bob", "Charlie"],
        "phone": [None, "+573001234567", None],
        "role": ["CLIENT", "ADMIN", "VETERINARY"],
        "failed_login_attempts": [0, 0, 1],
        "locked_until": [None, None, "2026-07-01T00:00:00Z"],
        "email_verified": [True, True, False],
        "profile_image": [None, None, None],
        "created_at": ["2026-01-01T00:00:00Z", "2026-02-01T00:00:00Z", "2026-06-01T00:00:00Z"],
    })


@pytest.fixture
def sample_pets():
    return pd.DataFrame({
        "id": ["p1", "p2"],
        "owner_id": ["u1", "u1"],
        "name": ["Fido", None],
        "species": ["dog", "cat"],
        "breed": [None, "Siamese"],
        "birth_date": [None, "2020-05-01"],
        "weight": [10.5, None],
        "microchip": [None, None],
        "vaccines_up_to_date": [True, False],
        "blood_type": [None, None],
        "created_at": ["2026-01-15T00:00:00Z", "2026-03-10T00:00:00Z"],
    })


@pytest.fixture
def sample_appointments():
    return pd.DataFrame({
        "id": ["a1", "a2", "a3"],
        "client_id": ["u1", "u1", "u2"],
        "pet_id": ["p1", "p1", "p2"],
        "professional_id": ["pr1", "pr1", "pr2"],
        "service_id": ["s1", "s2", "s1"],
        "branch_id": ["b1", "b1", "b2"],
        "clinic_id": ["c1", "c1", "c2"],
        "status": ["COMPLETED", "CANCELLED", "PENDING"],
        "start_time": ["2026-05-01T10:00:00Z", "2026-05-15T09:00:00Z", "2026-06-20T14:00:00Z"],
        "end_time": ["2026-05-01T10:30:00Z", None, None],
        "cancellation_reason": [None, "No show", None],
        "created_at": ["2026-04-28T00:00:00Z", "2026-05-10T00:00:00Z", "2026-06-18T00:00:00Z"],
    })


@pytest.fixture
def sample_clinics():
    return pd.DataFrame({
        "id": ["c1", "c2"],
        "owner_user_id": ["u2", "u2"],
        "name": ["Vet Prime", "Animal Hub"],
        "rating": [4.5, None],
        "is_verified": [True, False],
        "created_at": ["2025-01-01T00:00:00Z", "2025-06-01T00:00:00Z"],
    })


# ── Cleaners tests ────────────────────────────────────────────────────────────

def test_clean_users_drops_profile_image(sample_users):
    df = cleaners.clean_users(sample_users.copy())
    assert "profile_image" not in df.columns


def test_clean_users_created_at_is_datetime(sample_users):
    df = cleaners.clean_users(sample_users.copy())
    assert pd.api.types.is_datetime64_any_dtype(df["created_at"])


def test_clean_users_no_duplicate_emails(sample_users):
    # Inject a duplicate
    dup = sample_users.copy()
    dup = pd.concat([dup, dup.iloc[[0]]], ignore_index=True)
    df = cleaners.clean_users(dup)
    assert df["email"].duplicated().sum() == 0


def test_clean_pets_drops_blood_type(sample_pets):
    df = cleaners.clean_pets(sample_pets.copy())
    assert "blood_type" not in df.columns


def test_clean_pets_species_lowercase(sample_pets):
    df = cleaners.clean_pets(sample_pets.copy())
    assert all(s == s.lower() for s in df["species"])


def test_clean_pets_unknown_species_filled(sample_pets):
    raw = sample_pets.copy()
    raw.loc[0, "species"] = None
    df = cleaners.clean_pets(raw)
    assert df["species"].isna().sum() == 0
    assert "unknown" in df["species"].values


def test_clean_appointments_drops_cancellation_reason(sample_appointments):
    df = cleaners.clean_appointments(sample_appointments.copy())
    assert "cancellation_reason" not in df.columns


def test_clean_appointments_status_is_category(sample_appointments):
    df = cleaners.clean_appointments(sample_appointments.copy())
    assert df["status"].dtype.name == "category"


def test_clean_clinics_rating_filled(sample_clinics):
    df = cleaners.clean_clinics(sample_clinics.copy())
    assert df["rating"].isna().sum() == 0


# ── Metrics tests ─────────────────────────────────────────────────────────────

def test_compute_summary_keys(sample_users, sample_pets, sample_appointments, sample_clinics):
    users_df = cleaners.clean_users(sample_users.copy())
    pets_df = cleaners.clean_pets(sample_pets.copy())
    clinics_df = cleaners.clean_clinics(sample_clinics.copy())
    appts_df = cleaners.clean_appointments(sample_appointments.copy())

    result = metrics.compute_summary(users_df, pets_df, clinics_df, appts_df)

    assert result["totalUsers"] == 3
    assert result["totalPets"] == 2
    assert result["totalClinics"] == 2
    assert result["totalAppointments"] == 3
    assert result["completedAppointments"] == 1
    assert 0 <= result["conversionRate"] <= 100


def test_compute_user_metrics_roles(sample_users):
    users_df = cleaners.clean_users(sample_users.copy())
    result = metrics.compute_user_metrics(users_df)

    assert result["totalUsers"] == 3
    roles = {r["role"] for r in result["usersByRole"]}
    assert "CLIENT" in roles
    assert "ADMIN" in roles
    assert result["verifiedUsers"] == 2
    assert result["unverifiedUsers"] == 1


def test_compute_appointment_metrics_rates(sample_appointments, sample_clinics, sample_pets, sample_users):
    appts_df = cleaners.clean_appointments(sample_appointments.copy())
    clinics_df = cleaners.clean_clinics(sample_clinics.copy())
    pets_df = cleaners.clean_pets(sample_pets.copy())
    users_df = cleaners.clean_users(sample_users.copy())
    professionals_df = pd.DataFrame({
        "id": ["pr1", "pr2"],
        "user_id": ["u2", "u3"],
        "full_name": ["Dr. A", "Dr. B"],
        "branch_id": ["b1", "b2"],
        "specialty": ["General", "Surgery"],
        "years_of_experience": [5, 10],
        "is_active": [True, True],
        "created_at": ["2025-01-01", "2025-01-01"],
    })
    professionals_df = cleaners.clean_professionals(professionals_df)

    result = metrics.compute_appointment_metrics(appts_df, clinics_df, professionals_df, pets_df, users_df)

    assert result["totalAppointments"] == 3
    assert result["completedAppointments"] == 1
    assert result["cancelledAppointments"] == 1
    assert abs(result["completionRate"] - 33.33) < 0.1
    assert abs(result["cancellationRate"] - 33.33) < 0.1
