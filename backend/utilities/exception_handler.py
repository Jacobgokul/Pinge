from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
import logging
import traceback
from config import environment

logger = logging.getLogger(__name__)


async def universal_exception_handler(request: Request, exc: Exception):
    """
    Universal exception handler for all HTTP and unexpected exceptions.
    Provides consistent error responses and logging.
    
    Args:
        request: The FastAPI request object
        exc: The exception that was raised
    
    Returns:
        JSONResponse with error details
    """
    if isinstance(exc, HTTPException):
        # Log HTTP exceptions based on severity
        if exc.status_code >= 500:
            logger.error(
                f"HTTP {exc.status_code} Error on {request.method} {request.url.path}: {exc.detail}",
                extra={"client": request.client.host if request.client else None}
            )
        else:
            logger.warning(
                f"HTTP {exc.status_code} on {request.method} {request.url.path}: {exc.detail}"
            )
        
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.detail}
        )
    
    # Handle unexpected exceptions (500)
    logger.error(
        f"Unhandled exception on {request.method} {request.url.path}: {str(exc)}",
        extra={
            "traceback": traceback.format_exc(),
            "client": request.client.host if request.client else None
        }
    )
    
    # In development, return detailed error
    if environment.lower() == "dev":
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal server error",
                "detail": str(exc),
                "type": type(exc).__name__
            }
        )
    
    # In production, return generic error
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"}
    )