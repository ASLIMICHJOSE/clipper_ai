from fastapi import APIRouter
from backend.api.v1 import videos, clips, projects

api_router = APIRouter()

api_router.include_router(videos.router, prefix="/videos", tags=["videos"])
api_router.include_router(clips.router, prefix="/clips", tags=["clips"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
