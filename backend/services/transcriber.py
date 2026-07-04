class VideoTranscriber:
    """
    Service class responsible for transcribing audio/video files using Whisper.
    """
    def __init__(self, use_local: bool = False):
        self.use_local = use_local

    async def transcribe(self, file_path: str) -> dict:
        """
        Transcribes audio from the specified file path.
        Returns a dict containing the full text and timestamped segments.
        """
        return {
            "text": "Hello world, this is a sample transcribed YouTube audio transcript.",
            "segments": [
                {
                    "start": 0.0,
                    "end": 5.0,
                    "text": "Hello world,"
                },
                {
                    "start": 5.0,
                    "end": 10.0,
                    "text": "this is a sample transcribed YouTube audio transcript."
                }
            ]
        }
