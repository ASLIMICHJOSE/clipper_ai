from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.api.router import api_router
from contextlib import asynccontextmanager

# Create database tables (SQLite simplified setup for Phase 1)
# Note: For production, we'd use Alembic migrations, but for Phase 1 setup we auto-create.
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    yield
    # Shutdown actions

app = FastAPI(
    title="AI YouTube Viral Clip Generator API",
    description="Backend services for downloading, transcribing, clipping, and uploading YouTube Shorts.",
    version="1.0.0",
    lifespan=lifespan
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], # React / Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount central API router under /api/v1 prefix
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI YouTube Viral Clip Generator API. Visit /docs for OpenAPI documentation."}
