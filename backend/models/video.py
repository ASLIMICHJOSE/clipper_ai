from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database.session import Base

class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), index=True, nullable=False)
    youtube_id = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=True)
    url = Column(String(500), nullable=False)
    status = Column(String(50), default="pending")  # pending, downloading, transcribing, analyzing, completed, failed
    transcript = Column(Text, nullable=True)
    thumbnail = Column(String(500), nullable=True)
    duration = Column(Integer, nullable=True)
    channel = Column(String(255), nullable=True)
    views = Column(Integer, nullable=True)
    resolution_options = Column(Text, nullable=True)
    estimated_processing_time = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    clips = relationship("Clip", back_populates="video", cascade="all, delete-orphan")


class Clip(Base):
    __tablename__ = "clips"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.id", ondelete="CASCADE"), nullable=False)
    start_time = Column(Float, nullable=False)  # in seconds
    end_time = Column(Float, nullable=False)    # in seconds
    title = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    tags = Column(String(500), nullable=True)
    virality_score = Column(Float, nullable=True)
    status = Column(String(50), default="pending")  # pending, clipping, uploading, completed, failed
    file_path = Column(String(500), nullable=True)
    youtube_upload_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    video = relationship("Video", back_populates="clips")
