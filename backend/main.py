from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config.settings import settings
from backend.database.session import engine, Base, get_db
from backend.api.router import api_router
from backend.middleware.errors import GlobalExceptionMiddleware
from backend.utils.logging import logger
from contextlib import asynccontextmanager
from sqlalchemy.sql import text

# Automatic database initialization
try:
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
except Exception as e:
    logger.error(f"Failed to auto-initialize database tables: {str(e)}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up Clipper AI Backend Server...")
    yield
    logger.info("Shutting down Clipper AI Backend Server...")

app = FastAPI(
    title="AI YouTube Viral Clip Generator API",
    description="Backend services for downloading, transcribing, clipping, and uploading YouTube Shorts.",
    version="2.0.0",
    lifespan=lifespan
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception catch-all middleware
app.add_middleware(GlobalExceptionMiddleware)

# API routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to Clipper AI Backend API v2. Visit /docs for swagger docs."}

@app.get("/health")
def health_check():
    """
    Diagnostic health endpoint checking server and database connections.
    """
    db_status = "healthy"
    try:
        # Run a simple query to ping the DB connection pool
        db_gen = get_db()
        db = next(db_gen)
        db.execute(text("SELECT 1"))
        db.close()
    except Exception as e:
        logger.error(f"Health check failed on database verification: {str(e)}")
        db_status = f"unhealthy: {str(e)}"
        
    return {
        "status": "healthy" if "unhealthy" not in db_status else "degraded",
        "database": db_status,
        "environment": "local" if "sqlite" in settings.DATABASE_URL else "production"
    }
