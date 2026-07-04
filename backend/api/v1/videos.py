from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from backend.database.session import get_db
from backend.schemas.video import VideoCreate, VideoResponse
from backend.models.video import Video
from backend.utils.logging import logger

router = APIRouter()

@router.post("/", response_model=VideoResponse, status_code=201)
def import_video(video_in: VideoCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Import a YouTube video, download it, transcribe, and analyze.
    """
    url = video_in.url
    logger.info(f"Import requested for YouTube video: {url}")
    
    youtube_id = "extracted_id_placeholder"
    if "v=" in url:
        youtube_id = url.split("v=")[1].split("&")[0]
    elif "youtu.be/" in url:
        youtube_id = url.split("youtu.be/")[1].split("?")[0]
        
    db_video = db.query(Video).filter(Video.youtube_id == youtube_id).first()
    if db_video:
        logger.info(f"Video with YouTube ID {youtube_id} already exists.")
        return db_video
        
    new_video = Video(
        youtube_id=youtube_id,
        url=url,
        title="Processing...",
        status="pending"
    )
    db.add(new_video)
    db.commit()
    db.refresh(new_video)
    
    logger.info(f"Initialized project row for Video ID: {new_video.id}")
    return new_video

@router.get("/", response_model=List[VideoResponse])
def list_videos(db: Session = Depends(get_db)):
    """
    List all imported videos.
    """
    return db.query(Video).all()

@router.get("/{video_id}", response_model=VideoResponse)
def get_video(video_id: int, db: Session = Depends(get_db)):
    """
    Get detailed information about a single video including its generated clips.
    """
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video

@router.post("/{video_id}/analyze", response_model=VideoResponse)
def analyze_video(video_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Re-trigger viral clips analysis.
    """
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    video.status = "analyzing"
    db.commit()
    return video

@router.delete("/{video_id}")
def delete_video(video_id: int, db: Session = Depends(get_db)):
    """
    Delete a video and all associated clips.
    """
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    db.delete(video)
    db.commit()
    logger.info(f"Deleted Video ID: {video_id} and all related clips.")
    return {"message": "Video successfully deleted"}
