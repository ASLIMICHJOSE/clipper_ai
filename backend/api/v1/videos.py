from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from backend.database.session import get_db
from backend.schemas.video import VideoCreate, VideoResponse
from backend.models.video import Video
from backend.middleware.auth import get_current_user, CurrentUser
from backend.utils.logging import logger

router = APIRouter()

@router.post("/", response_model=VideoResponse, status_code=201)
def import_video(
    video_in: VideoCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Import a YouTube video, download it, transcribe, and analyze.
    """
    url = video_in.url
    logger.info(f"Import requested by user {current_user.id} for YouTube video: {url}")
    
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
        
    new_video = Video(
        youtube_id=youtube_id,
        url=url,
        title="Processing...",
        status="pending",
        user_id=current_user.id
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
