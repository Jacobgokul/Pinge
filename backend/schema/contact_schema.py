from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from uuid import UUID
from database.db_enum import ContactRequestStatus, GenderEnum

class SendContactRequest(BaseModel):
    receiver_email: EmailStr

class ContactRequestResponse(BaseModel):
    request_id: str
    sender_username: str
    sender_email: EmailStr
    receiver_username: str
    receiver_email: EmailStr
    status: ContactRequestStatus
    created_at: datetime
    
    @field_validator('request_id', mode="before")
    def uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v

class ContactResponse(BaseModel):
    contact_id: str
    username: str
    email: EmailStr
    gender: GenderEnum
    country: str
    connected_since: datetime
    
    @field_validator('contact_id', mode="before")
    def uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v
