from fastapi import APIRouter, Depends, Query
from typing import Optional

from app.auth import require_admin
from app.schemas import AppointmentMetricsResponse
from pipeline.database import get_engine
from pipeline import loaders, cleaners, metrics

router = APIRouter()


@router.get("/appointments", response_model=AppointmentMetricsResponse, summary="Appointment metrics")
def get_appointment_metrics(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    clinic_id: Optional[str] = Query(None),
    _: dict = Depends(require_admin),
):
    engine = get_engine()

    appointments_raw = loaders.load_appointments(engine, start_date, end_date)
    clinics_raw = loaders.load_clinics(engine)
    professionals_raw = loaders.load_professionals(engine)
    pets_raw = loaders.load_pets(engine)
    users_raw = loaders.load_users(engine)

    appointments_df = cleaners.clean_appointments(appointments_raw)
    clinics_df = cleaners.clean_clinics(clinics_raw)
    professionals_df = cleaners.clean_professionals(professionals_raw)
    pets_df = cleaners.clean_pets(pets_raw)
    users_df = cleaners.clean_users(users_raw)

    if clinic_id:
        appointments_df = appointments_df[appointments_df["clinic_id"] == clinic_id]

    return metrics.compute_appointment_metrics(
        appointments_df, clinics_df, professionals_df, pets_df, users_df
    )
