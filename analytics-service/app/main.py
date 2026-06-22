import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routers import summary, users, appointments, pets, clinics, professionals

load_dotenv()

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "info").upper(),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

app = FastAPI(
    title="PetQuotes Analytics Service",
    description="Admin-only analytics pipeline powered by pandas. "
                "All endpoints require a valid ADMIN JWT (HS256, same secret as the backend).",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None,
)

# CORS: only the NestJS gateway (internal Docker network) should reach this service.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://backend:3001", "http://localhost:3001"],
    allow_methods=["GET"],
    allow_headers=["Authorization"],
)

app.include_router(summary.router, prefix="/analytics", tags=["analytics"])
app.include_router(users.router, prefix="/analytics", tags=["analytics"])
app.include_router(appointments.router, prefix="/analytics", tags=["analytics"])
app.include_router(pets.router, prefix="/analytics", tags=["analytics"])
app.include_router(clinics.router, prefix="/analytics", tags=["analytics"])
app.include_router(professionals.router, prefix="/analytics", tags=["analytics"])


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok", "service": "analytics-service"}
