from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Clip Schemas
class ClipBase(BaseModel):
    start_time: float
    end_time: float
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[str] = None
    virality_score: Optional[float] = None
    status: Optional[str] = "pending"

class ClipCreate(ClipBase):
    video_id: int

class ClipResponse(ClipBase):
    id: int
    video_id: int
    file_path: Optional[str] = None
    youtube_upload_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Video Schemas
class VideoBase(BaseModel):
    url: str

class VideoCreate(VideoBase):
    thumbnail: Optional[str] = None
    duration: Optional[int] = None
    channel: Optional[str] = None
    views: Optional[int] = None
    resolution_options: Optional[str] = None
    estimated_processing_time: Optional[int] = None

class VideoResponse(BaseModel):
    id: int
    youtube_id: str
    title: Optional[str] = None
    url: str
    status: str
    transcript: Optional[str] = None
    thumbnail: Optional[str] = None
    duration: Optional[int] = None
    channel: Optional[str] = None
    views: Optional[int] = None
    resolution_options: Optional[str] = None
    estimated_processing_time: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    clips: List[ClipResponse] = []

    class Config:
        from_attributes = True
