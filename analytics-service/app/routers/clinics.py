from fastapi import APIRouter, Depends

from app.auth import require_admin
from app.schemas import ClinicMetricsResponse
from pipeline.database import get_engine
from pipeline import loaders, cleaners, metrics

router = APIRouter()


@router.get("/clinics", response_model=ClinicMetricsResponse, summary="Clinic metrics")
def get_clinic_metrics(_: dict = Depends(require_admin)):
    engine = get_engine()
    clinics_raw = loaders.load_clinics(engine)
    branches_raw = loaders.load_branches(engine)
    users_raw = loaders.load_users(engine)
    clinics_df = cleaners.clean_clinics(clinics_raw)
    branches_df = cleaners.clean_branches(branches_raw)
    users_df = cleaners.clean_users(users_raw)
    return metrics.compute_clinic_metrics(clinics_df, branches_df, users_df)
