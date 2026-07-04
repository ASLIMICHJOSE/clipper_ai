from fastapi import APIRouter
from backend.api.v1 import videos, clips

api_router = APIRouter()

api_router.include_router(videos.router, prefix="/videos", tags=["videos"])
api_router.include_router(clips.router, prefix="/clips", tags=["clips"])
