class VideoTranscriber:
    """
    Service class responsible for transcribing audio/video files using Whisper.
    """
    def __init__(self, use_local: bool = False):
        self.use_local = use_local

    async def transcribe(self, file_path: str) -> dict:
        """
        Transcribes audio from the specified file path using a local Whisper model.
        Returns a dict containing the full text and timestamped segments with speaker names.
        """
        import asyncio
        from backend.utils.logging import logger

        logger.info(f"Local Whisper: Starting transcription of {file_path}")

        # Run whisper in an executor thread since model loading and inference are cpu/gpu-bound and synchronous
        loop = asyncio.get_running_loop()

        def run_whisper():
            import whisper
            logger.info("Local Whisper: Loading 'tiny' model...")
            model = whisper.load_model("tiny")
            logger.info("Local Whisper: Model loaded. Running transcription...")

            result = model.transcribe(file_path)

            raw_segments = result.get("segments", [])
            segments = []

            # Heuristic turn-taking speaker diarization: alternate speakers on silence > 1.5s
            current_speaker = 1
            for i, seg in enumerate(raw_segments):
                start = float(seg.get("start", 0.0))
                end = float(seg.get("end", 0.0))
                text = seg.get("text", "").strip()

                if i > 0:
                    prev_end = segments[i-1]["end"]
                    if start - prev_end > 1.5:
                        current_speaker = 2 if current_speaker == 1 else 1

                segments.append({
                    "start": start,
                    "end": end,
                    "text": text,
                    "speaker": f"Speaker {current_speaker}"
                })

            return {
                "text": result.get("text", "").strip(),
                "segments": segments
            }

        return await loop.run_in_executor(None, run_whisper)
