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
