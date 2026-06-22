from fastapi import APIRouter, Depends, Query
from typing import Optional

from app.auth import require_admin
from app.schemas import SummaryResponse
from pipeline.database import get_engine
from pipeline import loaders, cleaners, metrics

router = APIRouter()


@router.get("/summary", response_model=SummaryResponse, summary="Dashboard KPIs")
def get_summary(
    start_date: Optional[str] = Query(None, description="ISO date filter for appointments (start)"),
    end_date: Optional[str] = Query(None, description="ISO date filter for appointments (end)"),
    _: dict = Depends(require_admin),
):
    engine = get_engine()

    users_raw = loaders.load_users(engine)
    pets_raw = loaders.load_pets(engine)
    clinics_raw = loaders.load_clinics(engine)
    appointments_raw = loaders.load_appointments(engine, start_date, end_date)

    users_df = cleaners.clean_users(users_raw)
    pets_df = cleaners.clean_pets(pets_raw)
    clinics_df = cleaners.clean_clinics(clinics_raw)
    appointments_df = cleaners.clean_appointments(appointments_raw)

    return metrics.compute_summary(users_df, pets_df, clinics_df, appointments_df)
