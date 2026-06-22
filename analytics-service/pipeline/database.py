import os
from sqlalchemy import create_engine, Engine

_engine: Engine | None = None


def get_engine() -> Engine:
    global _engine
    if _engine is None:
        db_url = os.getenv("ANALYTICS_DB_URL")
        if not db_url:
            raise RuntimeError("ANALYTICS_DB_URL environment variable is not set")
        _engine = create_engine(
            db_url,
            pool_size=5,
            max_overflow=10,
            pool_pre_ping=True,
            # Ensure the engine never issues writes
            execution_options={"no_parameters": False},
        )
    return _engine
