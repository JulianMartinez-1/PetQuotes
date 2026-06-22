from fastapi import APIRouter, Depends

from app.auth import require_admin
from app.schemas import UserMetricsResponse
from pipeline.database import get_engine
from pipeline import loaders, cleaners, metrics

router = APIRouter()


@router.get("/users", response_model=UserMetricsResponse, summary="User metrics")
def get_user_metrics(_: dict = Depends(require_admin)):
    engine = get_engine()
    users_raw = loaders.load_users(engine)
    users_df = cleaners.clean_users(users_raw)
    return metrics.compute_user_metrics(users_df)
