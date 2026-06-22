from fastapi import APIRouter, Depends

from app.auth import require_admin
from app.schemas import PetMetricsResponse
from pipeline.database import get_engine
from pipeline import loaders, cleaners, metrics

router = APIRouter()


@router.get("/pets", response_model=PetMetricsResponse, summary="Pet metrics")
def get_pet_metrics(_: dict = Depends(require_admin)):
    engine = get_engine()
    pets_raw = loaders.load_pets(engine)
    users_raw = loaders.load_users(engine)
    pets_df = cleaners.clean_pets(pets_raw)
    users_df = cleaners.clean_users(users_raw)
    return metrics.compute_pet_metrics(pets_df, users_df)
