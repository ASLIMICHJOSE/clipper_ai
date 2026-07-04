class YouTubeService:
    """
    Service class responsible for interacting with the YouTube Data API v3 (OAuth2 workflow, uploads).
    """
    def __init__(self, client_id: str, client_secret: str, redirect_uri: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri

    def get_authorization_url(self) -> str:
        """
        Generates the Google OAuth2 consent URL for the channel owner.
        """
        return "https://accounts.google.com/o/oauth2/auth?client_id=example"

    async def fetch_credentials(self, authorization_code: str) -> dict:
        """
        Exchanges authorization code for access/refresh tokens.
        """
        return {
            "access_token": "mock_access_token",
            "refresh_token": "mock_refresh_token"
        }

    async def upload_short(self, file_path: str, title: str, description: str, tags: list = None, credentials: dict = None) -> str:
        """
        Uploads a video to YouTube as a Short.
        Returns the YouTube video ID of the uploaded clip.
        """
        return "uploaded_youtube_video_id"
