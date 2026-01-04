from typing import List
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database.database import get_db
from database.models import UserRecords
from utilities.authentication_service import get_current_active_user
from schema.message_schema import (
    SendDirectMessage, 
    DirectMessageResponse, 
    CreateGroup, 
    GroupResponse, 
    SendGroupMessage,
    GroupMessageResponse,
    UnreadMessageCount,
    UnreadSummary,
    MarkAsReadRequest,
    AddGroupMembers,
    RemoveGroupMember,
    ChangeGroupRole,
    GroupMemberResponse,
    UpdateGroupInfo
)
from utilities.message_service import (
    send_direct_message_service,
    get_direct_messages_service,
    create_group_service,
    get_user_groups_service,
    send_group_message_service,
    get_group_messages_service,
    get_unread_messages_service,
    get_unread_count_service,
    mark_messages_as_read_service,
    mark_all_from_contact_as_read_service,
    add_group_members_service,
    remove_group_member_service,
    change_group_role_service,
    leave_group_service,
    delete_group_service,
    get_group_members_service,
    update_group_info_service
)

router = APIRouter(
    prefix="/messages",
    tags=["Messages"]
)

@router.post("/direct", response_model=DirectMessageResponse, status_code=status.HTTP_201_CREATED)
async def send_direct_message(
    payload: SendDirectMessage,
    current_user: UserRecords = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Send a direct message to another user.
    """
    return await send_direct_message_service(payload, current_user, db)

@router.get("/direct/{contact_id}", response_model=List[DirectMessageResponse])
async def get_direct_messages(
    contact_id: str,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: UserRecords = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get chat history with a specific contact.
    """
    return await get_direct_messages_service(contact_id, current_user, db, limit, offset)

@router.post("/groups", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
async def create_group(
    payload: CreateGroup,
    current_user: UserRecords = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new group chat.
    """
    return await create_group_service(payload, current_user, db)

@router.get("/groups", response_model=List[GroupResponse])
async def get_user_groups(
    current_user: UserRecords = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all groups you are a member of.
    """
    return await get_user_groups_service(current_user, db)

@router.post("/groups/{group_id}/messages", response_model=GroupMessageResponse)
async def send_group_message(
    group_id: str,
    payload: SendGroupMessage,
    current_user: UserRecords = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Send a message to a group.
    """
    return await send_group_message_service(group_id, payload, current_user, db)

@router.get("/groups/{group_id}/messages", response_model=List[GroupMessageResponse])
async def get_group_messages(
    group_id: str,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: UserRecords = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get messages from a group chat.
    """
    return await get_group_messages_service(group_id, current_user, db, limit, offset)

@router.get("/unread", response_model=List[DirectMessageResponse])
async def get_unread_messages(
    current_user: UserRecords = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all unread messages received by you.
    Returns list of unread messages with sender information.
    """
    return await get_unread_messages_service(current_user, db)

@router.get("/unread/count", response_model=UnreadSummary)
async def get_unread_count(
    current_user: UserRecords = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get unread message count per contact and total unread count.
    Useful for notification badges and message indicators.
    """
    return await get_unread_count_service(current_user, db)

@router.post("/mark-read")
async def mark_messages_as_read(
    payload: MarkAsReadRequest,
    current_user: UserRecords = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Mark specific messages as read.
    Provide list of message IDs to mark as read.
    """
    return await mark_messages_as_read_service(payload.message_ids, current_user, db)

@router.post("/mark-read/contact/{contact_id}")
async def mark_all_from_contact_as_read(
    contact_id: str,
    current_user: UserRecords = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Mark all unread messages from a specific contact as read.
    Useful when opening a chat conversation.
    """
    return await mark_all_from_contact_as_read_service(contact_id, current_user, db)

@router.post("/groups/{group_id}/members", status_code=status.HTTP_201_CREATED)
async def add_group_members(
    group_id: str,
    payload: AddGroupMembers,
    current_user: UserRecords = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Add new members to a group. Only group admins can add members.
    Provide list of user IDs to add.
    """
    return await add_group_members_service(group_id, payload.user_ids, current_user, db)

@router.delete("/groups/{group_id}/members/{user_id}")
async def remove_group_member(
    group_id: str,
    user_id: str,
    current_user: UserRecords = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Remove a member from the group. Only group admins can remove members.
    Cannot remove yourself - use leave endpoint instead.
    """
    return await remove_group_member_service(group_id, user_id, current_user, db)

@router.get("/groups/{group_id}/members", response_model=List[GroupMemberResponse])
async def get_group_members(
    group_id: str,
    current_user: UserRecords = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all members of a group with their roles.
    Must be a member of the group to view members.
    """
    return await get_group_members_service(group_id, current_user, db)

@router.patch("/groups/{group_id}/members/{user_id}/role")
async def change_group_member_role(
    group_id: str,
    user_id: str,
    payload: ChangeGroupRole,
    current_user: UserRecords = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Change a member's role (promote to Admin or demote to Member).
    Only group admins can change roles.
    """
    return await change_group_role_service(group_id, payload.user_id, payload.role, current_user, db)

@router.post("/groups/{group_id}/leave")
async def leave_group(
    group_id: str,
    current_user: UserRecords = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Leave a group you are a member of.
    If you are the last admin with other members, you must promote someone else first.
    """
    return await leave_group_service(group_id, current_user, db)

@router.delete("/groups/{group_id}")
async def delete_group(
    group_id: str,
    current_user: UserRecords = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a group permanently. Only group creator or admins can delete.
    This will delete all messages and member records.
    """
    return await delete_group_service(group_id, current_user, db)

@router.patch("/groups/{group_id}", response_model=GroupResponse)
async def update_group_info(
    group_id: str,
    payload: UpdateGroupInfo,
    current_user: UserRecords = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update group name and/or description. Only group admins can update.
    """
    return await update_group_info_service(group_id, payload.name, payload.description, current_user, db)

