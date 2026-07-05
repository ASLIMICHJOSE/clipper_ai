from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
import json
from backend.database.session import get_db
from backend.schemas.video import VideoCreate, VideoResponse
from backend.models.video import Video
from backend.middleware.auth import get_current_user, CurrentUser
from backend.utils.logging import logger
from backend.services.downloader import VideoDownloader

router = APIRouter()

class VideoPreviewRequest(BaseModel):
    url: str

@router.post("/preview", status_code=status.HTTP_200_OK)
async def preview_video(
    preview_in: VideoPreviewRequest,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Validate YouTube URL and retrieve its metadata preview using yt-dlp.
    """
    url = preview_in.url.strip()
    if not ("youtube.com" in url or "youtu.be" in url):
        raise HTTPException(status_code=400, detail="Invalid YouTube URL. Must be a valid youtube.com or youtu.be link.")
    
    downloader = VideoDownloader()
    info = await downloader.get_video_info(url)
    return info

@router.post("/", response_model=VideoResponse, status_code=201)
async def import_video(
    video_in: VideoCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Import a YouTube video, download it, transcribe, and analyze.
    """
    url = video_in.url.strip()
    logger.info(f"Import requested by user {current_user.id} for YouTube video: {url}")
    
    # Extract ID from URL for duplicate checking
    youtube_id = "extracted_id_placeholder"
    if "v=" in url:
        youtube_id = url.split("v=")[1].split("&")[0]
    elif "youtu.be/" in url:
        youtube_id = url.split("youtu.be/")[1].split("?")[0]
        
    db_video = db.query(Video).filter(
        Video.youtube_id == youtube_id,
        Video.user_id == current_user.id
    ).first()
    if db_video:
        logger.info(f"Video with YouTube ID {youtube_id} already exists for this user.")
        return db_video
        
    # Fetch rich metadata using VideoDownloader service
    downloader = VideoDownloader()
    info = await downloader.get_video_info(url)
    
    # Store resolutions as comma-separated or JSON string
    resolution_options_str = json.dumps(info.get("resolution_options", []))
    
    new_video = Video(
        youtube_id=info.get("youtube_id") or youtube_id,
        url=url,
        title=info.get("title") or "Processing...",
        status="pending",
        user_id=current_user.id,
        thumbnail=info.get("thumbnail"),
        duration=info.get("duration"),
        channel=info.get("channel"),
        views=info.get("views"),
        resolution_options=resolution_options_str,
        estimated_processing_time=info.get("estimated_processing_time")
    )
    db.add(new_video)
    db.commit()
    db.refresh(new_video)
    
    logger.info(f"Initialized project row for Video ID: {new_video.id} under user {current_user.id}")
    return new_video

@router.get("/", response_model=List[VideoResponse])
def list_videos(
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    List all imported videos for the current logged-in user.
    """
    return db.query(Video).filter(Video.user_id == current_user.id).all()

@router.get("/{video_id}", response_model=VideoResponse)
def get_video(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get detailed information about a single video including its generated clips.
    """
    video = db.query(Video).filter(
        Video.id == video_id,
        Video.user_id == current_user.id
    ).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found or not owned by user")
    return video

@router.post("/{video_id}/analyze", response_model=VideoResponse)
def analyze_video(
    video_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Re-trigger viral clips analysis.
    """
    video = db.query(Video).filter(
        Video.id == video_id,
        Video.user_id == current_user.id
    ).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found or not owned by user")
        
    video.status = "analyzing"
    db.commit()
    return video

@router.delete("/{video_id}")
def delete_video(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Delete a video and all associated clips.
    """
    video = db.query(Video).filter(
        Video.id == video_id,
        Video.user_id == current_user.id
    ).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found or not owned by user")
        
    db.delete(video)
    db.commit()
    logger.info(f"Deleted Video ID: {video_id} and all related clips by user {current_user.id}.")
    return {"message": "Video successfully deleted"}
