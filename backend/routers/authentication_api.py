from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from schema.auth_schema import RegisterUser, UserResponse, LoginResponse
from database.models import UserRecords
from database.database import get_db
from email_validator import validate_email, EmailNotValidError
from utilities.authentication_service import (
    register_user_service, 
    login_user_service, 
    logout_user_service,
    oauth2_scheme,
    get_current_user,
    get_current_active_user
)
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(
    prefix="/authentication",
    tags=["Authentication"]
)


@router.post("/register_user", status_code=status.HTTP_201_CREATED)
async def register_user(payload: RegisterUser, db: AsyncSession = Depends(get_db)):
    """
    Register a new user account.
    
    - **email**: Valid email address (must be unique)
    - **username**: Display name for the user
    - **password**: Password (minimum 8 characters)
    - **gender**: User's gender (Male/Female/Others)
    - **country**: User's country
    """
    try:
        email = validate_email(payload.email, check_deliverability=False)
    except EmailNotValidError:
        raise HTTPException(
            status_code=status.HTTP_406_NOT_ACCEPTABLE,
            detail="Mail id was not valid"
        )
    
    return await register_user_service(payload, db)

@router.get("/users", response_model=List[UserResponse])
async def get_all_user_records(
    db: AsyncSession = Depends(get_db),
    current_user: UserRecords = Depends(get_current_active_user)
):
    """
    Get all user records (Protected route - requires authentication).
    
    This endpoint demonstrates how to protect routes with authentication.
    Only authenticated users can access this endpoint.
    """
    recs = await db.execute(select(UserRecords))
    return recs.scalars().all()


@router.post("/login", response_model=LoginResponse)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """
    Login with email and password to get an access token.
    
    - **username**: Email address (OAuth2 spec uses 'username' field)
    - **password**: User's password
    
    Returns a JWT access token valid for 7 days.
    """
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    location = request.headers.get("x-location")  # example custom header from frontend
    device_info = request.headers.get("x-device-info")  # example custom header from frontend

    payload = {
        "email": form_data.username,
        "password": form_data.password,
        "ip_address": ip_address,
        "user_agent": user_agent,
        "location": location,
        "device_info": device_info,
    }
    return await login_user_service(payload, db)


@router.post("/logout")
async def logout(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    """
    Logout and invalidate the current session token.
    
    Requires authentication via Bearer token in Authorization header.
    """
    return await logout_user_service(token, db)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: UserRecords = Depends(get_current_active_user)
):
    """
    Get current authenticated user's information.
    
    This is a protected route that requires a valid JWT token.
    """
    return current_user