from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from database.database import get_db
from database.models import UserRecords
from utilities.authentication_service import get_current_active_user
from schema.contact_schema import (
    SendContactRequest, 
    ContactRequestResponse, 
    ContactResponse
)
from utilities.contact_service import (
    send_contact_request_service,
    accept_contact_request_service,
    reject_contact_request_service,
    get_contacts_service,
    get_pending_requests_service,
    remove_contact_service
)

router = APIRouter(
    prefix="/contacts",
    tags=["Contacts"]
)

@router.post("/send-request", status_code=status.HTTP_201_CREATED)
async def send_contact_request(
    payload: SendContactRequest,
    current_user: UserRecords = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Send a friend request to another user by email.
    """
    return await send_contact_request_service(payload, current_user, db)

@router.get("/requests", response_model=List[ContactRequestResponse])
async def get_pending_requests(
    current_user: UserRecords = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all pending friend requests received by you.
    """
    return await get_pending_requests_service(current_user, db)

@router.post("/accept/{request_id}")
async def accept_contact_request(
    request_id: str,
    current_user: UserRecords = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Accept a pending friend request.
    """
    return await accept_contact_request_service(request_id, current_user, db)

@router.post("/reject/{request_id}")
async def reject_contact_request(
    request_id: str,
    current_user: UserRecords = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Reject a pending friend request.
    """
    return await reject_contact_request_service(request_id, current_user, db)

@router.get("/", response_model=List[ContactResponse])
async def get_contacts(
    current_user: UserRecords = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get your list of friends/contacts.
    """
    return await get_contacts_service(current_user, db)

@router.delete("/{contact_id}")
async def remove_contact(
    contact_id: str,
    current_user: UserRecords = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Remove a user from your contacts list.
    """
    return await remove_contact_service(contact_id, current_user, db)
