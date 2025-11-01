from pydantic import BaseModel, EmailStr, field_validator
from database.db_enum import GenderEnum
from datetime import datetime
from uuid import UUID

# =================== Requset Schema ===================
class RegisterUser(BaseModel):
    email: EmailStr
    username: str
    password: str
    gender: GenderEnum
    country: str


# =================== Response Schema ===================
class UserResponse(BaseModel):
    user_id: str
    username: str
    email: EmailStr
    gender: GenderEnum
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True

    @field_validator('user_id', mode="before")
    def uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v
    
class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

