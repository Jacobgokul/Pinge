from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends
from utilities.websocket_manager import manager
from utilities.authentication_service import get_current_user
from database.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from jose import jwt, JWTError
from config import SECRET_KEY, ALGORITHM
from database.models import UserRecords

router = APIRouter(tags=["WebSocket"])

async def get_user_from_token(token: str, db: AsyncSession):
    """
    Validate token and get user for WebSocket connection.
    Manual validation since WebSocket doesn't support Authorization header nicely in all clients.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
            
        # Verify user exists
        # In a real app we might want to cache this or simplify checks for WS performance
        # For now, we trust the token signature + user_id presence
        return user_id
    except JWTError:
        return None

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket, 
    token: str = Query(...)
):
    """
    WebSocket endpoint for real-time connection.
    Requires 'token' query parameter.
    """
    # Verify token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=4003)
            return
    except JWTError:
        await websocket.close(code=4003)
        return

    await manager.connect(websocket, user_id)
    
    try:
        while True:
            # Wait for messages from the client
            # Clients can send "ping" or status updates
            data = await websocket.receive_json()
            
            # Handle client types if needed (e.g. "typing_start", "typing_stop")
            # For now we just echo or log
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as e:
        manager.disconnect(websocket, user_id)
