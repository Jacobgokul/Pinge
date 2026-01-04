from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from database.models import UserRecords, ContactRequest, Contact
from database.db_enum import ContactRequestStatus
from schema.contact_schema import SendContactRequest
from uuid import UUID
import logging

logger = logging.getLogger(__name__)

async def send_contact_request_service(payload: SendContactRequest, current_user: UserRecords, db: AsyncSession):
    """
    Send a contact request to another user by email.
    """
    # 1. Check if receiver exists
    result = await db.execute(select(UserRecords).where(UserRecords.email == payload.receiver_email))
    receiver = result.scalar_one_or_none()
    
    if not receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User with this email not found"
        )
        
    if receiver.user_id == current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot add yourself as a contact"
        )
    
    # 2. Check if request already exists or already contacts
    # Check for existing pending request (sent by current user)
    existing_req = await db.execute(select(ContactRequest).where(
        ContactRequest.sender_id == current_user.user_id,
        ContactRequest.receiver_id == receiver.user_id,
        ContactRequest.status == ContactRequestStatus.Pending
    ))
    if existing_req.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Friend request already sent"
        )
        
    # Check for existing pending request (received from that user)
    incoming_req = await db.execute(select(ContactRequest).where(
        ContactRequest.sender_id == receiver.user_id,
        ContactRequest.receiver_id == current_user.user_id,
        ContactRequest.status == ContactRequestStatus.Pending
    ))
    if incoming_req.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a pending request from this user"
        )
        
    # Check if already contacts
    existing_contact = await db.execute(select(Contact).where(
        Contact.user_id == current_user.user_id,
        Contact.contact_id == receiver.user_id
    ))
    if existing_contact.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already in your contacts"
        )
        
    # 3. Create request
    new_request = ContactRequest(
        sender_id=current_user.user_id,
        receiver_id=receiver.user_id,
        status=ContactRequestStatus.Pending
    )
    
    db.add(new_request)
    await db.commit()
    await db.refresh(new_request)
    
    logger.info(f"Contact request sent from {current_user.email} to {receiver.email}")
    return {"message": "Contact request sent successfully", "request_id": str(new_request.request_id)}

async def get_pending_requests_service(current_user: UserRecords, db: AsyncSession):
    """
    Get all pending contact requests received by the current user.
    """
    stmt = select(ContactRequest, UserRecords).join(
        UserRecords, ContactRequest.sender_id == UserRecords.user_id
    ).where(
        ContactRequest.receiver_id == current_user.user_id,
        ContactRequest.status == ContactRequestStatus.Pending
    )
    
    result = await db.execute(stmt)
    requests = result.all()
    
    response = []
    for req, sender in requests:
        response.append({
            "request_id": str(req.request_id),
            "sender_username": sender.username,
            "sender_email": sender.email,
            "receiver_username": current_user.username,
            "receiver_email": current_user.email,
            "status": req.status,
            "created_at": req.created_at
        })
        
    return response

async def accept_contact_request_service(request_id: str, current_user: UserRecords, db: AsyncSession):
    """
    Accept a pending contact request.
    """
    try:
        request_uuid = UUID(request_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid request ID format")
        
    # Find the request
    result = await db.execute(select(ContactRequest).where(
        ContactRequest.request_id == request_uuid,
        ContactRequest.receiver_id == current_user.user_id,
        ContactRequest.status == ContactRequestStatus.Pending
    ))
    contact_request = result.scalar_one_or_none()
    
    if not contact_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact request not found or not pending"
        )
        
    # Update status
    contact_request.status = ContactRequestStatus.Accepted
    
    # Create mutual contact records
    contact1 = Contact(user_id=current_user.user_id, contact_id=contact_request.sender_id)
    contact2 = Contact(user_id=contact_request.sender_id, contact_id=current_user.user_id)
    
    db.add(contact1)
    db.add(contact2)
    
    await db.commit()
    logger.info(f"Contact request accepted: {request_id}")
    return {"message": "Contact request accepted", "contact_id": str(contact_request.sender_id)}

async def reject_contact_request_service(request_id: str, current_user: UserRecords, db: AsyncSession):
    """
    Reject a pending contact request.
    """
    try:
        request_uuid = UUID(request_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid request ID format")
        
    result = await db.execute(select(ContactRequest).where(
        ContactRequest.request_id == request_uuid,
        ContactRequest.receiver_id == current_user.user_id,
        ContactRequest.status == ContactRequestStatus.Pending
    ))
    contact_request = result.scalar_one_or_none()
    
    if not contact_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact request not found"
        )
        
    contact_request.status = ContactRequestStatus.Rejected
    await db.commit()
    
    return {"message": "Contact request rejected"}

async def get_contacts_service(current_user: UserRecords, db: AsyncSession):
    """
    Get list of accepted contacts.
    """
    stmt = select(Contact, UserRecords).join(
        UserRecords, Contact.contact_id == UserRecords.user_id
    ).where(
        Contact.user_id == current_user.user_id
    )
    
    result = await db.execute(stmt)
    contacts = result.all()
    
    response = []
    for contact_rel, contact_user in contacts:
        response.append({
            "contact_id": str(contact_user.user_id),
            "username": contact_user.username,
            "email": contact_user.email,
            "gender": contact_user.gender,
            "country": contact_user.country,
            "connected_since": contact_rel.created_at
        })
        
    return response

async def remove_contact_service(contact_id: str, current_user: UserRecords, db: AsyncSession):
    """
    Remove a user from contacts (mutual removal).
    """
    try:
        contact_uuid = UUID(contact_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid contact ID format")
        
    # Find direct contact record
    result = await db.execute(select(Contact).where(
        Contact.user_id == current_user.user_id,
        Contact.contact_id == contact_uuid
    ))
    contact_record = result.scalar_one_or_none()
    
    if not contact_record:
        raise HTTPException(status_code=404, detail="Contact not found")
        
    # Find reverse contact record
    reverse_result = await db.execute(select(Contact).where(
        Contact.user_id == contact_uuid,
        Contact.contact_id == current_user.user_id
    ))
    reverse_record = reverse_result.scalar_one_or_none()
    
    # Delete both
    if contact_record:
        await db.delete(contact_record)
    if reverse_record:
        await db.delete(reverse_record)
        
    await db.commit()
    logger.info(f"Contact removed: {current_user.email} removed {contact_id}")
    
    return {"message": "Contact removed successfully"}
