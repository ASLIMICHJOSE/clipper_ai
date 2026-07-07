from supabase import create_client, Client
from backend.config.settings import settings
from backend.utils.logging import logger

supabase_client: Client = None

try:
    if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
        logger.info(f"Initializing Supabase client with URL: {settings.SUPABASE_URL}")
        supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
    else:
        logger.warning("Supabase URL or Anon Key is missing. Supabase integration is disabled.")
except Exception as e:
    logger.error(f"Failed to initialize Supabase client: {str(e)}")


def sync_video_to_supabase(video) -> None:
    """
    Synchronizes the video metadata from the SQLite database to Supabase.
    Runs inside a try-except block so that if the table is not set up on Supabase,
    the application logs a warning but continues functioning.
    """
    if not supabase_client:
        return

    try:
        payload = {
            "id": video.id,
            "user_id": video.user_id,
            "youtube_id": video.youtube_id,
            "title": video.title,
            "url": video.url,
            "status": video.status,
            "thumbnail": video.thumbnail,
            "duration": video.duration,
            "channel": video.channel,
            "views": video.views,
            "resolution_options": video.resolution_options,
            "estimated_processing_time": video.estimated_processing_time,
            "progress": float(video.progress) if video.progress is not None else 0.0,
            "speed": video.speed,
            "eta": video.eta,
            "file_path": video.file_path,
            "error_message": video.error_message,
            "transcript": video.transcript,
            "audio_path": video.audio_path,
            "audio_sample_rate": video.audio_sample_rate,
            "audio_channels": video.audio_channels,
            "audio_duration": float(video.audio_duration) if video.audio_duration is not None else None,
            "updated_at": video.updated_at.isoformat() if video.updated_at else None
        }
        
        logger.info(f"Syncing video {video.youtube_id} metadata to Supabase...")
        supabase_client.table("videos").upsert(payload).execute()
    except Exception as e:
        logger.error(f"Failed to sync video {video.youtube_id} to Supabase: {str(e)}")

