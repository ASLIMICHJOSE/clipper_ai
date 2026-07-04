from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from backend.database.session import get_db
from backend.schemas.video import ClipResponse
from backend.models.video import Clip, Video
from backend.middleware.auth import get_current_user, CurrentUser
from backend.utils.logging import logger

router = APIRouter()

@router.get("/{clip_id}", response_model=ClipResponse)
def get_clip(
    clip_id: int, 
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Retrieve details for a single clip.
    """
    clip = db.query(Clip).join(Video).filter(
        Clip.id == clip_id,
        Video.user_id == current_user.id
    ).first()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found or not owned by user")
    return clip

@router.patch("/{clip_id}", response_model=ClipResponse)
def update_clip(
    clip_id: int, 
    clip_update: ClipResponse, 
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Update clip metadata (title, description, tags) or trim settings.
    """
    clip = db.query(Clip).join(Video).filter(
        Clip.id == clip_id,
        Video.user_id == current_user.id
    ).first()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found or not owned by user")
        
    for key, value in clip_update.model_dump(exclude_unset=True).items():
        if hasattr(clip, key):
            setattr(clip, key, value)
            
    db.commit()
    db.refresh(clip)
    logger.info(f"Updated metadata for Clip ID: {clip_id} by user {current_user.id}")
    return clip

@router.post("/{clip_id}/render", response_model=ClipResponse)
def render_clip(
    clip_id: int, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Trigger FFmpeg to crop/render the clip with animated subtitles.
    """
    clip = db.query(Clip).join(Video).filter(
        Clip.id == clip_id,
        Video.user_id == current_user.id
    ).first()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found or not owned by user")
        
    clip.status = "clipping"
    db.commit()
    return clip

@router.post("/{clip_id}/upload", response_model=ClipResponse)
def upload_clip(
    clip_id: int, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Trigger YouTube API upload for a rendered clip.
    """
    clip = db.query(Clip).join(Video).filter(
        Clip.id == clip_id,
        Video.user_id == current_user.id
    ).first()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found or not owned by user")
        
    if clip.status != "completed" or not clip.file_path:
        raise HTTPException(status_code=400, detail="Clip must be fully rendered first")
        
    clip.status = "uploading"
    db.commit()
    return clip
