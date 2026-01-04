import uuid
from sqlalchemy import Column, DateTime, func, String, Enum as SQLAEnum, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from database.database import Base
from database.db_enum import GenderEnum, ContactRequestStatus, GroupRole
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


class ContactRequest(BaseModel):
    __tablename__ = "contact_requests"
    __table_args__ = (
        UniqueConstraint('sender_id', 'receiver_id', name='unique_friend_request'),
        {"extend_existing": True}
    )

    request_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("user_records.user_id"), nullable=False)
    receiver_id = Column(UUID(as_uuid=True), ForeignKey("user_records.user_id"), nullable=False)
    status = Column(SQLAEnum(ContactRequestStatus, name="contact_request_status"), default=ContactRequestStatus.Pending, nullable=False)

    sender = relationship("UserRecords", foreign_keys=[sender_id], backref="sent_requests")
    receiver = relationship("UserRecords", foreign_keys=[receiver_id], backref="received_requests")


class Contact(BaseModel):
    __tablename__ = "contacts"
    __table_args__ = (
        UniqueConstraint('user_id', 'contact_id', name='unique_contact'),
        {"extend_existing": True}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user_records.user_id"), nullable=False)
    contact_id = Column(UUID(as_uuid=True), ForeignKey("user_records.user_id"), nullable=False)

    user = relationship("UserRecords", foreign_keys=[user_id], backref="contacts_list")
    contact_user = relationship("UserRecords", foreign_keys=[contact_id])


class DirectMessage(BaseModel):
    __tablename__ = "direct_messages"
    __table_args__ = {"extend_existing": True}

    message_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("user_records.user_id"), nullable=False)
    receiver_id = Column(UUID(as_uuid=True), ForeignKey("user_records.user_id"), nullable=False)
    content = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    sent_at = Column(DateTime, default=func.now(), nullable=False)

    sender = relationship("UserRecords", foreign_keys=[sender_id])
    receiver = relationship("UserRecords", foreign_keys=[receiver_id])


class GroupChat(BaseModel):
    __tablename__ = "group_chats"
    __table_args__ = {"extend_existing": True}

    group_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("user_records.user_id"), nullable=False)
    
    members = relationship("GroupMember", back_populates="group", cascade="all, delete-orphan")
    messages = relationship("GroupMessage", back_populates="group", cascade="all, delete-orphan")


class GroupMember(BaseModel):
    __tablename__ = "group_members"
    __table_args__ = (
        UniqueConstraint('group_id', 'user_id', name='unique_group_member'),
        {"extend_existing": True}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    group_id = Column(UUID(as_uuid=True), ForeignKey("group_chats.group_id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user_records.user_id"), nullable=False)
    role = Column(SQLAEnum(GroupRole, name="group_role"), default=GroupRole.Member, nullable=False)
    joined_at = Column(DateTime, default=func.now(), nullable=False)

    group = relationship("GroupChat", back_populates="members")
    user = relationship("UserRecords")


class GroupMessage(BaseModel):
    __tablename__ = "group_messages"
    __table_args__ = {"extend_existing": True}

    message_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    group_id = Column(UUID(as_uuid=True), ForeignKey("group_chats.group_id"), nullable=False)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("user_records.user_id"), nullable=False)
    content = Column(String, nullable=False)
    sent_at = Column(DateTime, default=func.now(), nullable=False)

    group = relationship("GroupChat", back_populates="messages")
    sender = relationship("UserRecords")

