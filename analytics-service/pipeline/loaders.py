"""
Read-only data loaders — column names match Prisma's camelCase output in PostgreSQL.
Each function executes a SELECT and returns a raw pandas DataFrame; no cleaning here.
"""

import pandas as pd
from sqlalchemy import Engine, text


def load_users(engine: Engine) -> pd.DataFrame:
    query = """
    SELECT
        id,
        email,
        "fullName"          AS full_name,
        phone,
        role,
        "failedLoginAttempts" AS failed_login_attempts,
        "lockedUntil"       AS locked_until,
        "emailVerified"     AS email_verified,
        "profileImage"      AS profile_image,
        "createdAt"         AS created_at
    FROM users
    """
    return pd.read_sql(text(query), engine.connect())


def load_pets(engine: Engine) -> pd.DataFrame:
    query = """
    SELECT
        id,
        "ownerId"           AS owner_id,
        name,
        species,
        breed,
        "birthDate"         AS birth_date,
        weight,
        microchip,
        "vaccinesUpToDate"  AS vaccines_up_to_date,
        "bloodType"         AS blood_type,
        "createdAt"         AS created_at
    FROM pets
    """
    return pd.read_sql(text(query), engine.connect())


def load_appointments(engine: Engine, start_date: str | None = None, end_date: str | None = None) -> pd.DataFrame:
    conditions = []
    params: dict = {}
    if start_date:
        conditions.append('"startTime" >= :start_date')
        params["start_date"] = start_date
    if end_date:
        conditions.append('"startTime" <= :end_date')
        params["end_date"] = end_date

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    query = f"""
    SELECT
        id,
        "clientId"              AS client_id,
        "petId"                 AS pet_id,
        "professionalId"        AS professional_id,
        "serviceId"             AS service_id,
        "branchId"              AS branch_id,
        "clinicId"              AS clinic_id,
        status,
        "startTime"             AS start_time,
        "endTime"               AS end_time,
        "cancellationReason"    AS cancellation_reason,
        "createdAt"             AS created_at
    FROM appointments
    {where}
    """
    return pd.read_sql(text(query), engine.connect(), params=params)


def load_clinics(engine: Engine) -> pd.DataFrame:
    query = """
    SELECT
        id,
        "ownerUserId"   AS owner_user_id,
        name,
        rating,
        "isVerified"    AS is_verified,
        "createdAt"     AS created_at
    FROM clinics
    """
    return pd.read_sql(text(query), engine.connect())


def load_branches(engine: Engine) -> pd.DataFrame:
    query = """
    SELECT
        id,
        "clinicId"  AS clinic_id,
        name,
        city,
        "createdAt" AS created_at
    FROM branches
    """
    return pd.read_sql(text(query), engine.connect())


def load_professionals(engine: Engine) -> pd.DataFrame:
    query = """
    SELECT
        p.id,
        p."userId"              AS user_id,
        p."branchId"            AS branch_id,
        p.specialty,
        p."yearsOfExperience"   AS years_of_experience,
        p."isActive"            AS is_active,
        p."createdAt"           AS created_at,
        u."fullName"            AS full_name
    FROM professionals p
    JOIN users u ON p."userId" = u.id
    """
    return pd.read_sql(text(query), engine.connect())


def load_veterinary_services(engine: Engine) -> pd.DataFrame:
    query = """
    SELECT
        id,
        "clinicId"  AS clinic_id,
        name,
        price,
        category,
        "isActive"  AS is_active
    FROM "veterinary_services"
    """
    try:
        return pd.read_sql(text(query), engine.connect())
    except Exception:
        return pd.DataFrame(columns=["id", "clinic_id", "name", "price", "category", "is_active"])


def load_vaccines(engine: Engine) -> pd.DataFrame:
    query = """
    SELECT
        id,
        "petId"             AS pet_id,
        name,
        "dateAdministered"  AS date_administered,
        "expiryDate"        AS expiry_date,
        "nextDueDate"       AS next_due_date,
        "createdAt"         AS created_at
    FROM vaccines
    """
    try:
        return pd.read_sql(text(query), engine.connect())
    except Exception:
        return pd.DataFrame(columns=["id", "pet_id", "name", "date_administered", "expiry_date", "next_due_date", "created_at"])


def load_medications(engine: Engine) -> pd.DataFrame:
    query = """
    SELECT
        id,
        "petId"     AS pet_id,
        name,
        "startDate" AS start_date,
        "endDate"   AS end_date,
        status,
        "createdAt" AS created_at
    FROM medications
    """
    try:
        return pd.read_sql(text(query), engine.connect())
    except Exception:
        return pd.DataFrame(columns=["id", "pet_id", "name", "start_date", "end_date", "status", "created_at"])


def load_notifications(engine: Engine) -> pd.DataFrame:
    query = """
    SELECT
        id,
        "userId"    AS user_id,
        type,
        read,
        "createdAt" AS created_at
    FROM notifications
    """
    try:
        return pd.read_sql(text(query), engine.connect())
    except Exception:
        return pd.DataFrame(columns=["id", "user_id", "type", "read", "created_at"])
