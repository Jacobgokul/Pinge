from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

from config import config

# Extract DB credentials
username = config["DataBase"]["username"]
password = config["DataBase"]["password"]
ip_address = config["DataBase"]["ip_address"]
port = config.get("DB_PORT", 5432)
database_name = config["DataBase"]["database_name"]

# Async DB connection string (using asyncpg driver)
DATABASE_URL = f"postgresql+asyncpg://{username}:{password}@{ip_address}:{port}/{database_name}"

# Create async engine with connection pool config
engine = create_async_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    echo=False,  # Set to True for SQL debug logging
)

# Base class for your models
Base = declarative_base()

# Async session factory
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Async dependency function to get DB session for FastAPI.
    Yields an async session and handles commit/rollback.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
