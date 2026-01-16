from pydantic import BaseModel, field_validator
from datetime import datetime
from uuid import UUID
from typing import List, Optional

class SendDirectMessage(BaseModel):
    receiver_id: str
    content: str
    
    @field_validator('receiver_id')
    def validate_uuid(cls, v):
        try:
            UUID(v)
            return v
        except ValueError:
            raise ValueError('Invalid UUID format')

class DirectMessageResponse(BaseModel):
    message_id: str
    sender_id: str
    receiver_id: str
    content: str
    is_read: bool
    sent_at: datetime
    
    class Config:
        from_attributes = True

    @field_validator('message_id', 'sender_id', 'receiver_id', mode="before")
    def uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v

class CreateGroup(BaseModel):
    name: str
    description: Optional[str] = None
    members: List[str] = []  # List of user_ids to add initially

class SendGroupMessage(BaseModel):
    content: str

class GroupResponse(BaseModel):
    group_id: str
    name: str
    description: Optional[str]
    created_by: str
    created_at: datetime
    
    class Config:
        from_attributes = True

    @field_validator('group_id', 'created_by', mode="before")
    def uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v

class GroupMessageResponse(BaseModel):
    message_id: str
    group_id: str
    sender_id: str
    sender_name: str
    content: str
    sent_at: datetime
    
    class Config:
        from_attributes = True

    @field_validator('message_id', 'group_id', 'sender_id', mode="before")
    def uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v

class UnreadMessageCount(BaseModel):
    contact_id: str
    contact_name: str
    unread_count: int
    last_message_at: Optional[datetime]

    @field_validator('contact_id', mode="before")
    def uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v

class GroupUnreadCount(BaseModel):
    group_id: str
    group_name: str
    unread_count: int
    last_message_at: Optional[datetime]

    @field_validator('group_id', mode="before")
    def uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v

class UnreadSummary(BaseModel):
    total_unread: int
    contacts_with_unread: List[UnreadMessageCount]
    groups_with_unread: List[GroupUnreadCount]
    total_group_unread: int

class MarkAsReadRequest(BaseModel):
    message_ids: List[str]
    
    @field_validator('message_ids')
    def validate_uuids(cls, v):
        for msg_id in v:
            try:
                UUID(msg_id)
            except ValueError:
                raise ValueError(f'Invalid UUID format: {msg_id}')
        return v

class AddGroupMembers(BaseModel):
    user_ids: List[str]
    
    @field_validator('user_ids')
    def validate_uuids(cls, v):
        if not v:
            raise ValueError('At least one user_id is required')
        for user_id in v:
            try:
                UUID(user_id)
            except ValueError:
                raise ValueError(f'Invalid UUID format: {user_id}')
        return v

class RemoveGroupMember(BaseModel):
    user_id: str
    
    @field_validator('user_id')
    def validate_uuid(cls, v):
        try:
            UUID(v)
            return v
        except ValueError:
            raise ValueError('Invalid UUID format')

class ChangeGroupRole(BaseModel):
    user_id: str
    role: str  # "Admin" or "Member"
    
    @field_validator('user_id')
    def validate_uuid(cls, v):
        try:
            UUID(v)
            return v
        except ValueError:
            raise ValueError('Invalid UUID format')
    
    @field_validator('role')
    def validate_role(cls, v):
        if v not in ["Admin", "Member"]:
            raise ValueError('Role must be either "Admin" or "Member"')
        return v

class GroupMemberResponse(BaseModel):
    user_id: str
    username: str
    email: str
    role: str
    joined_at: datetime
    
    @field_validator('user_id', mode="before")
    def uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v

class UpdateGroupInfo(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    
    @field_validator('name')
    def validate_name(cls, v):
        if v is not None and len(v.strip()) == 0:
            raise ValueError('Group name cannot be empty')
        return v

