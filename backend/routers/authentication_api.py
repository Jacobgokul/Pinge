from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from schema.auth_schema import RegisterUser, UserResponse
from database.models import UserRecords
from database.database import get_db
from email_validator import validate_email, EmailNotValidError
from utilities.authentication_service import register_user_service

router = APIRouter(
    prefix="/authentication",
    tags=["Authentication"]
)

@router.post("/register_user")
async def register_user(payload: RegisterUser, db: AsyncSession = Depends(get_db)):
    try:
        email = validate_email(payload.email, check_deliverability=False)
    except EmailNotValidError:
        raise HTTPException(
            status_code=status.HTTP_406_NOT_ACCEPTABLE,
            detail="Mail id was not valid"
        )
    
    return await register_user_service(payload, db)

@router.get("/users", response_model=List[UserResponse])
async def get_all_user_records(db: AsyncSession = Depends(get_db)):
    recs = await db.execute(select(UserRecords))
    return recs.scalars().all()
    