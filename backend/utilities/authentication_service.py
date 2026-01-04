from fastapi import HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.models import UserRecords, UserSession
from database.database import get_db
from schema.auth_schema import RegisterUser
from jose import jwt, JWTError
from datetime import datetime, timedelta
from passlib.context import CryptContext
from config import SECRET_KEY, ALGORITHM
import logging
from fastapi.security import OAuth2PasswordBearer

logger = logging.getLogger(__name__)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="authentication/login")


def hash_password(password: str) -> str:
    """Hash a plain text password"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """
    Create a JWT access token with expiration.
    
    Args:
        data: Payload data to encode
        expires_delta: Token expiration time (default: 7 days)
    
    Returns:
        Encoded JWT token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=7)
    
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> UserRecords:
    """
    Dependency to get the current authenticated user from JWT token.
    Validates token and checks if session is still active.
    
    Args:
        token: JWT access token from Authorization header
        db: Database session
    
    Returns:
        UserRecords object of authenticated user
    
    Raises:
        HTTPException: If token is invalid or session is inactive
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Log token for debugging (first 20 chars only for security)
        logger.debug(f"Received token: {token[:20] if token else 'None'}... (length: {len(token) if token else 0})")
        
        # Check if token is empty or invalid format
        if not token or not token.strip():
            logger.warning("Empty or whitespace token received")
            raise credentials_exception
            
        # Decode JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        
        if user_id is None:
            logger.warning("Token missing 'sub' claim")
            raise credentials_exception
        
        # Check if session exists and is active
        result = await db.execute(
            select(UserSession).where(
                UserSession.access_token == token,
                UserSession.is_active == True
            )
        )
        session = result.scalar_one_or_none()
        
        if not session:
            logger.warning(f"No active session found for token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session expired or invalid. Please login again."
            )
        
        # Fetch user
        user_result = await db.execute(
            select(UserRecords).where(UserRecords.user_id == user_id)
        )
        user = user_result.scalar_one_or_none()
        
        if not user or not user.is_active:
            logger.warning(f"User {user_id} not found or inactive")
            raise credentials_exception
        
        return user
        
    except JWTError as e:
        logger.error(f"JWT decode error: {e}")
        raise credentials_exception


async def get_current_active_user(
    current_user: UserRecords = Depends(get_current_user)
) -> UserRecords:
    """
    Dependency to ensure user is active.
    Can be extended for additional checks (email verified, etc.)
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account"
        )
    return current_user


async def register_user_service(payload: RegisterUser, db: AsyncSession):
    """
    Register a new user in the system.
    
    Args:
        payload: User registration data
        db: Database session
    
    Returns:
        Success message with user_id
    
    Raises:
        HTTPException: If email already exists
    """
    # Check if email already exists
    result = await db.execute(select(UserRecords).where(UserRecords.email == payload.email))
    email_exists = result.scalar_one_or_none()

    if email_exists:
        logger.warning(f"Registration attempt with existing email: {payload.email}")
        raise HTTPException(
            status_code=status.HTTP_406_NOT_ACCEPTABLE,
            detail="Email already registered, try a different one"
        )

    # Validate password strength
    from utilities.generic import validate_password_complexity
    if not validate_password_complexity(payload.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 chars with uppercase, lowercase, number & special char"
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

    logger.info(f"New user registered: {new_user.email} (ID: {new_user.user_id})")
    return {"message": "User registered successfully", "user_id": str(new_user.user_id)}

async def login_user_service(payload: dict, db: AsyncSession):
    """
    Authenticate user and create a new session.
    
    Args:
        payload: Login credentials and device info
        db: Database session
    
    Returns:
        JWT access token and token type
    
    Raises:
        HTTPException: If credentials are invalid
    """
    email = payload["email"]
    password = payload["password"]
    ip_address = payload.get("ip_address")
    user_agent = payload.get("user_agent")
    location = payload.get("location")
    device_info = payload.get("device_info")

    # 1. Fetch user by email
    result = await db.execute(select(UserRecords).where(UserRecords.email == email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(password, user.password):
        logger.warning(f"Failed login attempt for email: {email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    if not user.is_active:
        logger.warning(f"Login attempt for inactive user: {email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Please contact support."
        )

    # 2. Create JWT token payload
    token_data = {
        "sub": str(user.user_id),
        "username": user.username,
        "email": user.email
    }

    access_token = create_access_token(token_data)

    # 3. Create a new session record for this device/login
    new_session = UserSession(
        user_id=user.user_id,
        access_token=access_token,
        ip_address=ip_address,
        user_agent=user_agent,
        location=location,
        device_info=device_info
    )
    db.add(new_session)
    await db.commit()

    logger.info(f"User logged in: {user.email} from IP: {ip_address}")

    # 4. Return token response
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

async def logout_user_service(access_token: str, db: AsyncSession):
    """
    Logout user by deactivating their session.
    
    Args:
        access_token: JWT token to invalidate
        db: Database session
    
    Returns:
        Success message
    
    Raises:
        HTTPException: If token is invalid or already logged out
    """
    # Mark session inactive or delete session for this token
    result = await db.execute(select(UserSession).where(UserSession.access_token == access_token))
    session = result.scalar_one_or_none()

    if not session:
        logger.warning("Logout attempt with invalid token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token or already logged out"
        )
    
    if not session.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already logged out"
        )

    session.is_active = False
    await db.commit()
    
    logger.info(f"User logged out: Session {session.session_id}")
    return {"message": "Logged out successfully"}
