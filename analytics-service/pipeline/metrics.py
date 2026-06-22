"""
Metric computation layer.
Receives clean DataFrames from cleaners.py and returns plain dicts / lists
ready for Pydantic serialization.
No I/O here — all DB work happens in loaders.py.
"""

from __future__ import annotations

import pandas as pd
from datetime import datetime, timezone


def _now() -> datetime:
    return datetime.now(tz=timezone.utc)


def _today_start() -> pd.Timestamp:
    today = _now().date()
    return pd.Timestamp(today, tz="UTC")


# ── Dashboard / Summary KPIs ──────────────────────────────────────────────────

def compute_summary(
    users_df: pd.DataFrame,
    pets_df: pd.DataFrame,
    clinics_df: pd.DataFrame,
    appointments_df: pd.DataFrame,
) -> dict:
    total_appointments = len(appointments_df)
    completed = (appointments_df["status"] == "COMPLETED").sum()
    conversion_rate = round(float(completed) / total_appointments * 100, 2) if total_appointments else 0.0

    today = _today_start()
    new_users_today = int((users_df["created_at"] >= today).sum())
    new_appointments_today = int((appointments_df["created_at"] >= today).sum())

    by_status = (
        appointments_df["status"]
        .value_counts()
        .rename_axis("status")
        .reset_index(name="count")
        .assign(count=lambda d: d["count"].astype(int))
        .to_dict(orient="records")
    )

    # Appointments trend: count per calendar day
    trend_df = (
        appointments_df.assign(date=appointments_df["start_time"].dt.date)
        .groupby("date")
        .size()
        .reset_index(name="count")
    )
    trend_df["date"] = trend_df["date"].astype(str)
    appointments_trend = trend_df.to_dict(orient="records")

    return {
        "totalUsers": int(len(users_df)),
        "totalPets": int(len(pets_df)),
        "totalClinics": int(len(clinics_df)),
        "totalAppointments": total_appointments,
        "completedAppointments": int(completed),
        "conversionRate": conversion_rate,
        "newUsersToday": new_users_today,
        "newAppointmentsToday": new_appointments_today,
        "appointmentsByStatus": by_status,
        "appointmentsTrend": appointments_trend,
    }


# ── User Metrics ──────────────────────────────────────────────────────────────

def compute_user_metrics(users_df: pd.DataFrame) -> dict:
    total = len(users_df)
    by_role = (
        users_df["role"]
        .value_counts()
        .rename_axis("role")
        .reset_index(name="count")
        .assign(count=lambda d: d["count"].astype(int))
        .to_dict(orient="records")
    )

    verified = int(users_df["email_verified"].sum())
    unverified = total - verified
    locked = int(users_df["locked_until"].notna().sum())

    now = _now()
    today = _today_start()
    week_ago = pd.Timestamp(now) - pd.Timedelta(days=7)
    month_ago = pd.Timestamp(now) - pd.Timedelta(days=30)

    new_today = int((users_df["created_at"] >= today).sum())
    new_week = int((users_df["created_at"] >= week_ago).sum())
    new_month = int((users_df["created_at"] >= month_ago).sum())

    trend_df = (
        users_df.assign(date=users_df["created_at"].dt.date)
        .groupby("date")
        .size()
        .reset_index(name="count")
    )
    trend_df["date"] = trend_df["date"].astype(str)

    return {
        "totalUsers": total,
        "usersByRole": by_role,
        "verifiedUsers": verified,
        "unverifiedUsers": unverified,
        "lockedUsers": locked,
        "newUsersToday": new_today,
        "newUsersThisWeek": new_week,
        "newUsersThisMonth": new_month,
        "userRegistrationTrend": trend_df.to_dict(orient="records"),
    }


# ── Appointment Metrics ───────────────────────────────────────────────────────

def compute_appointment_metrics(
    appointments_df: pd.DataFrame,
    clinics_df: pd.DataFrame,
    professionals_df: pd.DataFrame,
    pets_df: pd.DataFrame,
    users_df: pd.DataFrame,
) -> dict:
    total = len(appointments_df)
    completed = int((appointments_df["status"] == "COMPLETED").sum())
    cancelled = int((appointments_df["status"] == "CANCELLED").sum())

    by_status = (
        appointments_df["status"]
        .value_counts()
        .rename_axis("status")
        .reset_index(name="count")
        .assign(count=lambda d: d["count"].astype(int))
        .to_dict(orient="records")
    )

    # Trend per day
    trend_df = (
        appointments_df.assign(date=appointments_df["start_time"].dt.date)
        .groupby("date")
        .size()
        .reset_index(name="count")
    )
    trend_df["date"] = trend_df["date"].astype(str)

    # Appointments per clinic
    by_clinic = (
        appointments_df.groupby("clinic_id")
        .size()
        .reset_index(name="count")
        .merge(clinics_df[["id", "name"]], left_on="clinic_id", right_on="id", how="left")
        .rename(columns={"clinic_id": "clinicId", "name": "clinicName"})
        .assign(count=lambda d: d["count"].astype(int))
        [["clinicId", "clinicName", "count"]]
        .sort_values("count", ascending=False)
        .to_dict(orient="records")
    )

    # Appointments per professional
    by_professional = (
        appointments_df.groupby("professional_id")
        .size()
        .reset_index(name="count")
        .merge(professionals_df[["id", "full_name"]], left_on="professional_id", right_on="id", how="left")
        .rename(columns={"professional_id": "professionalId", "full_name": "professionalName"})
        .assign(count=lambda d: d["count"].astype(int))
        [["professionalId", "professionalName", "count"]]
        .sort_values("count", ascending=False)
        .to_dict(orient="records")
    )

    # Top 10 most-attended pets
    top_pets = (
        appointments_df.groupby("pet_id")
        .size()
        .reset_index(name="appointmentCount")
        .merge(pets_df[["id", "name"]], left_on="pet_id", right_on="id", how="left")
        .rename(columns={"pet_id": "petId", "name": "petName"})
        .assign(appointmentCount=lambda d: d["appointmentCount"].astype(int))
        .sort_values("appointmentCount", ascending=False)
        .head(10)
        [["petId", "petName", "appointmentCount"]]
        .to_dict(orient="records")
    )

    # Top 10 most-active clients
    top_clients = (
        appointments_df.groupby("client_id")
        .size()
        .reset_index(name="appointmentCount")
        .merge(users_df[["id", "full_name"]], left_on="client_id", right_on="id", how="left")
        .rename(columns={"client_id": "clientId", "full_name": "clientName"})
        .assign(appointmentCount=lambda d: d["appointmentCount"].astype(int))
        .sort_values("appointmentCount", ascending=False)
        .head(10)
        [["clientId", "clientName", "appointmentCount"]]
        .to_dict(orient="records")
    )

    return {
        "totalAppointments": total,
        "completedAppointments": completed,
        "cancelledAppointments": cancelled,
        "completionRate": round(float(completed) / total * 100, 2) if total else 0.0,
        "cancellationRate": round(float(cancelled) / total * 100, 2) if total else 0.0,
        "appointmentsByStatus": by_status,
        "appointmentsTrend": trend_df.to_dict(orient="records"),
        "appointmentsByClinic": by_clinic,
        "appointmentsByProfessional": by_professional,
        "topPetsWithAppointments": top_pets,
        "topClientsWithAppointments": top_clients,
    }


# ── Pet Metrics ───────────────────────────────────────────────────────────────

def compute_pet_metrics(pets_df: pd.DataFrame, users_df: pd.DataFrame) -> dict:
    total = len(pets_df)
    by_species = (
        pets_df["species"]
        .value_counts()
        .rename_axis("species")
        .reset_index(name="count")
        .assign(count=lambda d: d["count"].astype(int))
        .to_dict(orient="records")
    )

    vaccines_up = int(pets_df["vaccines_up_to_date"].sum())
    vaccines_down = total - vaccines_up

    top_owners = (
        pets_df.groupby("owner_id")
        .size()
        .reset_index(name="petCount")
        .merge(users_df[["id", "full_name"]], left_on="owner_id", right_on="id", how="left")
        .rename(columns={"owner_id": "ownerId", "full_name": "ownerName"})
        .assign(petCount=lambda d: d["petCount"].astype(int))
        .sort_values("petCount", ascending=False)
        .head(10)
        [["ownerId", "ownerName", "petCount"]]
        .to_dict(orient="records")
    )

    return {
        "totalPets": total,
        "petsBySpecies": by_species,
        "petsWithUpdatedVaccines": vaccines_up,
        "petsWithoutUpdatedVaccines": vaccines_down,
        "topOwnersWithPets": top_owners,
    }


# ── Clinic Metrics ────────────────────────────────────────────────────────────

def compute_clinic_metrics(
    clinics_df: pd.DataFrame,
    branches_df: pd.DataFrame,
    users_df: pd.DataFrame,
) -> dict:
    total = len(clinics_df)
    verified = int(clinics_df["is_verified"].sum())

    by_city = (
        branches_df["city"]
        .value_counts()
        .rename_axis("city")
        .reset_index(name="count")
        .assign(count=lambda d: d["count"].astype(int))
        .to_dict(orient="records")
    )

    by_clinic = (
        branches_df.groupby("clinic_id")
        .size()
        .reset_index(name="branchCount")
        .merge(clinics_df[["id", "name"]], left_on="clinic_id", right_on="id", how="left")
        .rename(columns={"clinic_id": "clinicId", "name": "clinicName"})
        .assign(branchCount=lambda d: d["branchCount"].astype(int))
        .sort_values("branchCount", ascending=False)
        [["clinicId", "clinicName", "branchCount"]]
        .to_dict(orient="records")
    )

    return {
        "totalClinics": total,
        "verifiedClinics": verified,
        "unverifiedClinics": total - verified,
        "totalBranches": int(len(branches_df)),
        "branchesByCity": by_city,
        "branchesByClinic": by_clinic,
    }


# ── Professional Metrics ──────────────────────────────────────────────────────

def compute_professional_metrics(
    professionals_df: pd.DataFrame,
    branches_df: pd.DataFrame,
) -> dict:
    total = len(professionals_df)
    active = int(professionals_df["is_active"].sum())

    by_specialty = (
        professionals_df["specialty"]
        .value_counts()
        .rename_axis("specialty")
        .reset_index(name="count")
        .assign(count=lambda d: d["count"].astype(int))
        .to_dict(orient="records")
    )

    by_branch = (
        professionals_df.groupby("branch_id")
        .size()
        .reset_index(name="count")
        .merge(branches_df[["id", "name"]], left_on="branch_id", right_on="id", how="left")
        .rename(columns={"branch_id": "branchId", "name": "branchName"})
        .assign(count=lambda d: d["count"].astype(int))
        .sort_values("count", ascending=False)
        [["branchId", "branchName", "count"]]
        .to_dict(orient="records")
    )

    return {
        "totalProfessionals": total,
        "activeProfessionals": active,
        "inactiveProfessionals": total - active,
        "professionalsBySpecialty": by_specialty,
        "professionalsByBranch": by_branch,
    }
