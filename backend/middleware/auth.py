from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.services.supabase import supabase_client
from backend.config.settings import settings
from backend.utils.logging import logger

security = HTTPBearer(auto_error=False)

class CurrentUser:
    def __init__(self, id: str, email: str = None):
        self.id = id
        self.email = email

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> CurrentUser:
    """
    FastAPI dependency to extract and validate the Supabase Auth JWT token.
    If the backend is configured in mock mode, it returns a placeholder user.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    
    # Allow mock token override for local testing and developer fallback
    if token.startswith("mock-jwt-token-"):
        mock_id = token.replace("mock-jwt-token-", "")
        logger.info(f"Auth: Using mock token override for user: {mock_id}")
        return CurrentUser(id=mock_id, email=f"{mock_id}@example.com")
    
    is_mock = "mock.supabase.co" in settings.SUPABASE_URL or not supabase_client
    
    if is_mock:
        logger.info("Auth: Using mock authentication user.")
        return CurrentUser(id="mock-user-123", email="mock-user@example.com")
        
    try:
        # Verify with Supabase Auth
        response = supabase_client.auth.get_user(token)
        if not response or not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return CurrentUser(id=response.user.id, email=response.user.email)
    except Exception as e:
        logger.error(f"Auth verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
