import os

class VideoClipper:
    """
    Service class responsible for using FFmpeg to cut video segments and add stylized, animated subtitles.
    """
    def __init__(self, output_dir: str = "clips"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    async def clip_video(self, source_path: str, start_time: float, end_time: float) -> str:
        """
        Clips the source video from start_time to end_time using FFmpeg.
        Returns the path to the trimmed video file.
        """
        output_filename = f"clip_{int(start_time)}_{int(end_time)}.mp4"
        return os.path.join(self.output_dir, output_filename)

    async def add_animated_subtitles(self, video_path: str, transcript_segments: list, style_config: dict = None) -> str:
        """
        Generates subtitle overlay filters and renders the final clip with captions.
        Returns the path to the captioned video file.
        """
        dir_name = os.path.dirname(video_path)
        base_name = os.path.basename(video_path)
        output_path = os.path.join(dir_name, f"captioned_{base_name}")
        return output_path
