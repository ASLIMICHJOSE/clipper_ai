from sqlalchemy import Column, String, Integer, DateTime, Text
from datetime import datetime
from backend.database.session import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    owner_id = Column(String(100), index=True, nullable=False)
    thumbnail = Column(String(500), nullable=True)
    status = Column(String(50), default="active")  # active, archived
