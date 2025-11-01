import uuid
from sqlalchemy import Column, DateTime, func, String, Enum as SQLAEnum, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from database.database import Base
from database.db_enum import GenderEnum
from sqlalchemy.orm import relationship


class BaseModel(Base):
    __abstract__ = True

    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)


class UserRecords(BaseModel):
    __tablename__ = "user_records"
    __table_args__ = {"extend_existing": True}

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    email = Column(String, nullable=False, unique=True)
    username = Column(String, nullable=False)
    password = Column(String, nullable=False)
    gender = Column(SQLAEnum(GenderEnum, name="gender_enum"), nullable=False)
    country = Column(String, nullable=False)

    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")


class UserSession(BaseModel):
    __tablename__ = "user_sessions"
    __table_args__ = {"extend_existing": True}

    session_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user_records.user_id"), nullable=False)
    access_token = Column(String, nullable=False, unique=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    location = Column(String, nullable=True)
    device_info = Column(String, nullable=True)

    user = relationship("UserRecords", back_populates="sessions")