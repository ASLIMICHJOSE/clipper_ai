from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.config.settings import settings
from backend.utils.logging import logger

# For SQLite fallback, we require connect_args={"check_same_thread": False}
is_sqlite = settings.DATABASE_URL.startswith("sqlite")

try:
    logger.info(f"Connecting to database using: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else settings.DATABASE_URL}")
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False} if is_sqlite else {},
        pool_pre_ping=True # Helps prevent disconnected sessions
    )
except Exception as e:
    logger.error(f"Failed to create database engine for URL: {settings.DATABASE_URL}. Fallback to local SQLite.")
    engine = create_engine(
        "sqlite:///./clipper.db",
        connect_args={"check_same_thread": False},
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    Context session generator to bind db sessions to request lifecycles.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
