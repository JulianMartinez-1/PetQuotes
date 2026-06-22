from fastapi import APIRouter, Depends

from app.auth import require_admin
from app.schemas import ProfessionalMetricsResponse
from pipeline.database import get_engine
from pipeline import loaders, cleaners, metrics

router = APIRouter()


@router.get("/professionals", response_model=ProfessionalMetricsResponse, summary="Professional metrics")
def get_professional_metrics(_: dict = Depends(require_admin)):
    engine = get_engine()
    professionals_raw = loaders.load_professionals(engine)
    branches_raw = loaders.load_branches(engine)
    professionals_df = cleaners.clean_professionals(professionals_raw)
    branches_df = cleaners.clean_branches(branches_raw)
    return metrics.compute_professional_metrics(professionals_df, branches_df)
