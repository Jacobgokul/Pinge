import uuid
from sqlalchemy import Column, DateTime, func, String, Enum as SQLAEnum, Boolean
from sqlalchemy.dialects.postgresql import UUID
from database.database import Base
from database.db_enum import GenderEnum


class BaseModel(Base):
    __abstract__ = True

    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)


class UserRecords(BaseModel):
    __tablename__ = "user_records"
    __table_args__ = {"extend_existing": True}

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    email = Column(String, nullable=False, unique=True)
    username = Column(String, nullable=False)
    password = Column(String, nullable=False)
    gender = Column(SQLAEnum(GenderEnum, name="gender_enum"), nullable=False)
    country = Column(String, nullable=False)
