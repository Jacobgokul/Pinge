from fastapi import FastAPI
from config import config, environment
from database.database import engine
from database.models import Base

app = FastAPI(
    title="Pinge",
    docs_url="/docs",           
    redoc_url="/redoc",         
    openapi_url="/openapi.json" 
)


# Disable interactive API docs in non-dev environments
if environment.lower() != "dev":
    app.redoc_url = None
    app.docs_url = None
    app.openapi_url = None

from utilities.middleware import WrapSuccessResponseMiddleware

app.add_middleware(WrapSuccessResponseMiddleware)


# Import and include your API routers
from routers import authentication_api
app.include_router(authentication_api.router)

from fastapi import FastAPI, Request, HTTPException
from utilities.exception_handler import universal_exception_handler

app.add_exception_handler(HTTPException, universal_exception_handler)
app.add_exception_handler(Exception, universal_exception_handler)

# Create tables using async engine
@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        print("trigering")
        await conn.run_sync(Base.metadata.create_all)
