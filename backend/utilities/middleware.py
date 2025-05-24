from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse
import json

class WrapSuccessResponseMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        # Skip swagger UI & openapi routes
        if request.url.path.startswith("/docs") or \
           request.url.path.startswith("/redoc") or \
           request.url.path.startswith("/openapi.json"):
            return await call_next(request)

        response = await call_next(request)

        if response.status_code < 400:
            body = [section async for section in response.body_iterator]
            content = b"".join(body).decode()
            try:
                payload = json.loads(content)
            except json.JSONDecodeError:
                payload = content

            return JSONResponse(
                status_code=response.status_code,
                content={"success": True, "data": payload},
            )
        return response
