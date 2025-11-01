from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from config import config, environment
from database.database import engine
from database.models import Base
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    Replaces deprecated @app.on_event decorators.
    """
    # Startup: Create database tables
    logger.info("Starting up Pinge application...")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        raise
    
    yield  # Application runs here
    
    # Shutdown: Cleanup resources
    logger.info("Shutting down Pinge application...")
    await engine.dispose()
    logger.info("Database connections closed")


# Initialize FastAPI app with lifespan
app = FastAPI(
    title="Pinge",
    description="Real-time messaging application API",
    version="1.0.0",
    docs_url="/docs" if environment.lower() == "dev" else None,
    redoc_url="/redoc" if environment.lower() == "dev" else None,
    openapi_url="/openapi.json" if environment.lower() == "dev" else None,
    lifespan=lifespan
)

# Add middleware
from utilities.middleware import WrapSuccessResponseMiddleware
app.add_middleware(WrapSuccessResponseMiddleware)

# Add exception handlers
from utilities.exception_handler import universal_exception_handler
app.add_exception_handler(HTTPException, universal_exception_handler)
app.add_exception_handler(Exception, universal_exception_handler)

# Include routers
from routers import authentication_api
app.include_router(authentication_api.router)


@app.get("/", tags=["Health"])
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "Pinge API is running",
        "version": "1.0.0",
        "status": "healthy"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "environment": environment
    }
