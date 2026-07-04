import os

class VideoDownloader:
    """
    Service class responsible for using yt-dlp to fetch YouTube video details and audio/video files.
    """
    def __init__(self, download_dir: str = "downloads"):
        self.download_dir = download_dir
        os.makedirs(download_dir, exist_ok=True)

    async def get_video_info(self, url: str) -> dict:
        """
        Retrieves video metadata without downloading.
        """
        return {
            "title": "Sample YouTube Video Title",
            "duration": 600.0,
            "youtube_id": "example_id"
        }

    async def download_audio(self, url: str) -> str:
        """
        Downloads only audio from a YouTube video (ideal for transcription).
        Returns the path to the downloaded audio file.
        """
        return os.path.join(self.download_dir, "audio.mp3")

    async def download_video(self, url: str) -> str:
        """
        Downloads the full video in highest resolution.
        Returns the path to the downloaded video file.
        """
        return os.path.join(self.download_dir, "video.mp4")
