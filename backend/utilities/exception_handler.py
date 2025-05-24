from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse

async def universal_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        # For HTTPExceptions, use their status code and detail
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.detail}
        )
    
    # Handle unexpected exceptions (500)
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error"}
    )