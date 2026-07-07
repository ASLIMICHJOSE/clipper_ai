from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
import json
import time
import os
from backend.database.session import get_db, SessionLocal
from backend.schemas.video import VideoCreate, VideoResponse
from backend.models.video import Video, Clip
from backend.middleware.auth import get_current_user, CurrentUser
from backend.utils.logging import logger
from backend.services.downloader import VideoDownloader, CANCELLED_DOWNLOADS, DownloadCancelledException
from backend.services.supabase import sync_video_to_supabase
from backend.config.settings import settings

async def process_video_import(video_id: int, url: str, user_id: str):
    logger.info(f"Background task: starting import for video ID {video_id}")
    db = SessionLocal()
    try:
        video = db.query(Video).filter(Video.id == video_id).first()
        if not video:
            logger.error(f"Video {video_id} not found in database.")
            return

        downloader = VideoDownloader()
        
        last_update_time = [0.0]
        last_progress_pct = [0.0]

        def progress_callback(progress, speed, eta):
            now = time.time()
            if progress - last_progress_pct[0] >= 1.0 or now - last_update_time[0] >= 1.5:
                last_progress_pct[0] = progress
                last_update_time[0] = now
                
                callback_db = SessionLocal()
                try:
                    v = callback_db.query(Video).filter(Video.id == video_id).first()
                    if v:
                        v.status = "downloading"
                        v.progress = round(progress, 1)
                        v.speed = speed
                        v.eta = eta
                        callback_db.commit()
                        callback_db.refresh(v)
                        sync_video_to_supabase(v)
                except Exception as e:
                    logger.error(f"Error in progress callback DB update: {str(e)}")
                finally:
                    callback_db.close()

        video.status = "downloading"
        video.progress = 0.0
        video.speed = "0 B/s"
        video.eta = "estimating..."
        db.commit()
        db.refresh(video)
        sync_video_to_supabase(video)

        file_path = await downloader.download_video(url, video_id, progress_callback)

        if video_id in CANCELLED_DOWNLOADS:
            raise DownloadCancelledException("Download cancelled by user")

        # Set status to extracting
        last_update_time[0] = 0.0
        last_progress_pct[0] = 0.0

        video.status = "extracting"
        video.progress = 0.0
        video.speed = None
        video.eta = None
        video.file_path = file_path
        db.commit()
        db.refresh(video)
        sync_video_to_supabase(video)

        # Set up output path
        audio_dir = os.path.join(settings.STORAGE_DIR, "audio")
        audio_filename = f"{video.youtube_id}.mp3"
        target_audio_path = os.path.join(audio_dir, audio_filename)

        def extraction_progress_callback(progress):
            now = time.time()
            if progress - last_progress_pct[0] >= 1.0 or now - last_update_time[0] >= 1.5:
                last_progress_pct[0] = progress
                last_update_time[0] = now
                
                callback_db = SessionLocal()
                try:
                    v = callback_db.query(Video).filter(Video.id == video_id).first()
                    if v:
                        v.status = "extracting"
                        v.progress = round(progress, 1)
                        callback_db.commit()
                        callback_db.refresh(v)
                        sync_video_to_supabase(v)
                except Exception as e:
                    logger.error(f"Error in extraction progress callback DB update: {str(e)}")
                finally:
                    callback_db.close()

        await downloader.extract_audio(file_path, target_audio_path, float(video.duration or 0), extraction_progress_callback)

        if video_id in CANCELLED_DOWNLOADS:
            raise DownloadCancelledException("Download cancelled by user")

        # Query metadata
        metadata = downloader.get_audio_metadata(target_audio_path)

        # Save metadata and advance to transcribing
        video.audio_path = target_audio_path
        video.audio_duration = metadata.get("duration") or float(video.duration or 0.0)
        video.audio_sample_rate = metadata.get("sample_rate") or 44100
        video.audio_channels = metadata.get("channels") or 2
        video.status = "transcribing"
        video.progress = 50.0
        db.commit()
        db.refresh(video)
        sync_video_to_supabase(video)


        from backend.services.transcriber import VideoTranscriber
        transcriber = VideoTranscriber()
        transcript_data = await transcriber.transcribe(file_path)
        
        video.transcript = transcript_data.get("text")
        video.status = "analyzing"
        video.progress = 80.0
        db.commit()
        db.refresh(video)
        sync_video_to_supabase(video)

        from backend.services.analyzer import ViralityAnalyzer
        analyzer = ViralityAnalyzer(settings.GROQ_API_KEY)
        candidates = await analyzer.analyze_transcript(transcript_data)

        db.query(Clip).filter(Clip.video_id == video.id).delete()
        
        for c in candidates:
            clip = Clip(
                video_id=video.id,
                start_time=c.get("start_time"),
                end_time=c.get("end_time"),
                title=c.get("title"),
                description=c.get("reason"),
                virality_score=c.get("virality_score"),
                status="pending",
                tags=c.get("seo", {}).get("tags"),
            )
            db.add(clip)

        video.status = "completed"
        video.progress = 100.0
        db.commit()
        db.refresh(video)
        sync_video_to_supabase(video)
        logger.info(f"Video {video_id} processing completed successfully.")

    except DownloadCancelledException:
        logger.info(f"Video {video_id} download was cancelled.")
        video = db.query(Video).filter(Video.id == video_id).first()
        if video:
            video.status = "cancelled"
            video.progress = 0.0
            video.speed = None
            video.eta = None
            video.error_message = "Download cancelled by user."
            db.commit()
            db.refresh(video)
            sync_video_to_supabase(video)
            
            try:
                downloader = VideoDownloader()
                youtube_id = video.youtube_id
                for f in os.listdir(downloader.download_dir):
                    if youtube_id in f:
                        os.remove(os.path.join(downloader.download_dir, f))
                        logger.info(f"Cleaned up partial file: {f}")
            except Exception as ex:
                logger.error(f"Error cleaning up partial downloads: {str(ex)}")

    except Exception as e:
        logger.error(f"Video {video_id} processing failed: {str(e)}")
        video = db.query(Video).filter(Video.id == video_id).first()
        if video:
            video.status = "failed"
            video.error_message = str(e)
            video.progress = 0.0
            video.speed = None
            video.eta = None
            db.commit()
            db.refresh(video)
            sync_video_to_supabase(video)
    finally:
        db.close()


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
    
    # Sync initial pending row to Supabase
    sync_video_to_supabase(new_video)
    
    # Start the background downloader and processing pipeline
    background_tasks.add_task(process_video_import, new_video.id, url, current_user.id)
    
    logger.info(f"Initialized project row for Video ID: {new_video.id} under user {current_user.id} and queued download.")
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


@router.get("/{video_id}/status")
def get_video_status(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get detailed real-time progress, speed, ETA, and status of a video download.
    """
    video = db.query(Video).filter(
        Video.id == video_id,
        Video.user_id == current_user.id
    ).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    return {
        "id": video.id,
        "youtube_id": video.youtube_id,
        "status": video.status,
        "progress": video.progress,
        "speed": video.speed,
        "eta": video.eta,
        "error_message": video.error_message
    }


@router.post("/{video_id}/cancel")
def cancel_video_download(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Cancel an active video download.
    """
    video = db.query(Video).filter(
        Video.id == video_id,
        Video.user_id == current_user.id
    ).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    if video.status not in ["pending", "downloading"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel a download in status: {video.status}"
        )
        
    # Mark in active cancelled downloads
    CANCELLED_DOWNLOADS.add(video_id)
    
    # Update DB status
    video.status = "cancelled"
    video.error_message = "Download cancelled by user."
    db.commit()
    db.refresh(video)
    sync_video_to_supabase(video)
    
    return {"message": "Download cancellation requested", "video": video}


@router.post("/{video_id}/retry")
def retry_video_download(
    video_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Retry a failed or cancelled video download.
    """
    video = db.query(Video).filter(
        Video.id == video_id,
        Video.user_id == current_user.id
    ).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    if video.status not in ["failed", "cancelled"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot retry a video in status: {video.status}"
        )
        
    # Ensure it's not in the cancelled downloads set
    if video_id in CANCELLED_DOWNLOADS:
        CANCELLED_DOWNLOADS.discard(video_id)
        
    # Reset status and progress metadata
    video.status = "pending"
    video.progress = 0.0
    video.speed = None
    video.eta = None
    video.error_message = None
    db.commit()
    db.refresh(video)
    sync_video_to_supabase(video)
    
    # Queue the download task again
    background_tasks.add_task(process_video_import, video.id, video.url, current_user.id)
    
    return {"message": "Retry task started successfully", "video": video}

