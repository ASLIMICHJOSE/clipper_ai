from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from backend.database.session import get_db
from backend.schemas.video import ClipResponse
from backend.models.video import Clip
from backend.utils.logging import logger

router = APIRouter()

@router.get("/{clip_id}", response_model=ClipResponse)
def get_clip(clip_id: int, db: Session = Depends(get_db)):
    """
    Retrieve details for a single clip.
    """
    clip = db.query(Clip).filter(Clip.id == clip_id).first()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")
    return clip

@router.patch("/{clip_id}", response_model=ClipResponse)
def update_clip(clip_id: int, clip_update: ClipResponse, db: Session = Depends(get_db)):
    """
    Update clip metadata (title, description, tags) or trim settings.
    """
    clip = db.query(Clip).filter(Clip.id == clip_id).first()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")
        
    for key, value in clip_update.model_dump(exclude_unset=True).items():
        if hasattr(clip, key):
            setattr(clip, key, value)
            
    db.commit()
    db.refresh(clip)
    logger.info(f"Updated metadata for Clip ID: {clip_id}")
    return clip

@router.post("/{clip_id}/render", response_model=ClipResponse)
def render_clip(clip_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Trigger FFmpeg to crop/render the clip with animated subtitles.
    """
    clip = db.query(Clip).filter(Clip.id == clip_id).first()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")
        
    clip.status = "clipping"
    db.commit()
    return clip

@router.post("/{clip_id}/upload", response_model=ClipResponse)
def upload_clip(clip_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Trigger YouTube API upload for a rendered clip.
    """
    clip = db.query(Clip).filter(Clip.id == clip_id).first()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")
        
    if clip.status != "completed" or not clip.file_path:
        raise HTTPException(status_code=400, detail="Clip must be fully rendered first")
        
    clip.status = "uploading"
    db.commit()
    return clip
