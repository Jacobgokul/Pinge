from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.models import UserRecords
from schema.auth_schema import RegisterUser

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

async def register_user_service(payload: RegisterUser, db: AsyncSession):
    # Check if email already exists
    result = await db.execute(select(UserRecords).where(UserRecords.email == payload.email))
    email_exists = result.scalar_one_or_none()

    if email_exists:
        raise HTTPException(
            status_code=status.HTTP_406_NOT_ACCEPTABLE,
            detail="Email already registered, try a different one"
        )

    new_user = UserRecords(
        email=payload.email,
        username=payload.username,
        password=hash_password(payload.password),
        gender=payload.gender,
        country=payload.country
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return {"message": "User registered successfully", "user_id": str(new_user.user_id)}
