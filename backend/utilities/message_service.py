from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, desc, func
from database.models import UserRecords, DirectMessage, GroupChat, GroupMember, GroupMessage
from database.db_enum import GroupRole
from schema.message_schema import SendDirectMessage, CreateGroup, SendGroupMessage
from utilities.websocket_manager import manager
from uuid import UUID
import logging

logger = logging.getLogger(__name__)

async def send_direct_message_service(payload: SendDirectMessage, current_user: UserRecords, db: AsyncSession):
    """
    Send a direct message to another user.
    """
    try:
        receiver_uuid = UUID(payload.receiver_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid receiver ID")
        
    # Check if receiver exists
    result = await db.execute(select(UserRecords).where(UserRecords.user_id == receiver_uuid))
    receiver = result.scalar_one_or_none()
    
    if not receiver:
        raise HTTPException(status_code=404, detail="User not found")
        
    new_message = DirectMessage(
        sender_id=current_user.user_id,
        receiver_id=receiver_uuid,
        content=payload.content
    )
    
    db.add(new_message)
    await db.commit()
    await db.refresh(new_message)
    
    # Get updated unread count for receiver
    from sqlalchemy import func
    unread_count_result = await db.execute(
        select(func.count(DirectMessage.message_id)).where(
            DirectMessage.receiver_id == receiver_uuid,
            DirectMessage.is_read == False
        )
    )
    total_unread = unread_count_result.scalar()
    
    # Notify receiver via WebSocket
    ws_payload = {
        "event": "new_direct_message",
        "data": {
            "message_id": str(new_message.message_id),
            "sender_id": str(current_user.user_id),
            "sender_name": current_user.username,
            "content": new_message.content,
            "sent_at": new_message.sent_at.isoformat(),
            "total_unread": total_unread
        }
    }
    await manager.send_personal_message(ws_payload, str(receiver_uuid))
    
    return new_message

async def get_direct_messages_service(contact_id: str, current_user: UserRecords, db: AsyncSession, limit: int = 50, offset: int = 0):
    """
    Get chat history between current user and a contact.
    """
    try:
        contact_uuid = UUID(contact_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid contact ID")
        
    # Fetch messages sent by either user to the other
    stmt = select(DirectMessage).where(
        or_(
            and_(DirectMessage.sender_id == current_user.user_id, DirectMessage.receiver_id == contact_uuid),
            and_(DirectMessage.sender_id == contact_uuid, DirectMessage.receiver_id == current_user.user_id)
        )
    ).order_by(desc(DirectMessage.sent_at)).limit(limit).offset(offset)
    
    result = await db.execute(stmt)
    messages = result.scalars().all()
    
    # Return reversed list (oldest first) for chat UI usually, but API returns latest first by default query
    # Let's return as queried (descending) or ascending? 
    # Usually APIs return history most recent first for pagination, but UI displays oldest at top.
    # We'll return as queried.
    return messages

async def create_group_service(payload: CreateGroup, current_user: UserRecords, db: AsyncSession):
    """
    Create a new group chat.
    """
    new_group = GroupChat(
        name=payload.name,
        description=payload.description,
        created_by=current_user.user_id
    )
    db.add(new_group)
    await db.flush() # flush to get group_id
    
    # Add creator as admin
    admin_member = GroupMember(
        group_id=new_group.group_id,
        user_id=current_user.user_id,
        role=GroupRole.Admin
    )
    db.add(admin_member)
    
    # Add other members
    for member_id in payload.members:
        try:
            user_uuid = UUID(member_id)
            # Verify user exists
            user_res = await db.execute(select(UserRecords).where(UserRecords.user_id == user_uuid))
            if user_res.scalar_one_or_none():
                member = GroupMember(
                    group_id=new_group.group_id,
                    user_id=user_uuid,
                    role=GroupRole.Member
                )
                db.add(member)
        except ValueError:
            continue
            
    await db.commit()
    await db.refresh(new_group)
    return new_group

async def get_user_groups_service(current_user: UserRecords, db: AsyncSession):
    """
    Get all groups the user is a member of.
    """
    stmt = select(GroupChat).join(GroupMember).where(GroupMember.user_id == current_user.user_id)
    result = await db.execute(stmt)
    return result.scalars().all()

async def send_group_message_service(group_id: str, payload: SendGroupMessage, current_user: UserRecords, db: AsyncSession):
    """
    Send a message to a group.
    """
    try:
        group_uuid = UUID(group_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid group ID")
        
    # Check if user is member
    member_check = await db.execute(select(GroupMember).where(
        GroupMember.group_id == group_uuid,
        GroupMember.user_id == current_user.user_id
    ))
    if not member_check.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="You are not a member of this group")
        
    new_message = GroupMessage(
        group_id=group_uuid,
        sender_id=current_user.user_id,
        content=payload.content
    )
    db.add(new_message)
    await db.commit()
    await db.refresh(new_message)
    
    # Get all group members to notify
    members_result = await db.execute(select(GroupMember).where(GroupMember.group_id == group_uuid))
    members = members_result.scalars().all()
    
    ws_payload = {
        "event": "new_group_message",
        "data": {
            "message_id": str(new_message.message_id),
            "group_id": str(new_message.group_id),
            "sender_id": str(new_message.sender_id),
            "sender_name": current_user.username,
            "content": new_message.content,
            "sent_at": new_message.sent_at.isoformat()
        }
    }
    
    for member in members:
        # Don't send back to sender (optional, but usually sender UI updates optimistically)
        # But for consistency let's send to everyone or exclude sender? 
        # Plan didn't specify, but let's exclude sender from WS push to avoid duplicate if frontend handles it,
        # or include if frontend relies on it. Safe bet: send to others.
        if member.user_id != current_user.user_id:
            await manager.send_personal_message(ws_payload, str(member.user_id))
    
    return {
        "message_id": str(new_message.message_id),
        "group_id": str(new_message.group_id),
        "sender_id": str(new_message.sender_id),
        "sender_name": current_user.username,
        "content": new_message.content,
        "sent_at": new_message.sent_at
    }

async def get_group_messages_service(group_id: str, current_user: UserRecords, db: AsyncSession, limit: int = 50, offset: int = 0):
    """
    Get messages for a group.
    """
    try:
        group_uuid = UUID(group_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid group ID")
        
    # Check membership
    member_check = await db.execute(select(GroupMember).where(
        GroupMember.group_id == group_uuid,
        GroupMember.user_id == current_user.user_id
    ))
    if not member_check.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="You are not a member of this group")
        
    stmt = select(GroupMessage, UserRecords.username).join(
        UserRecords, GroupMessage.sender_id == UserRecords.user_id
    ).where(
        GroupMessage.group_id == group_uuid
    ).order_by(desc(GroupMessage.sent_at)).limit(limit).offset(offset)
    
    result = await db.execute(stmt)
    rows = result.all()
    
    response = []
    for msg, username in rows:
        response.append({
            "message_id": str(msg.message_id),
            "group_id": str(msg.group_id),
            "sender_id": str(msg.sender_id),
            "sender_name": username,
            "content": msg.content,
            "sent_at": msg.sent_at
        })
        
    return response

async def get_unread_messages_service(current_user: UserRecords, db: AsyncSession):
    """
    Get all unread messages received by the current user.
    """
    stmt = select(DirectMessage, UserRecords.username).join(
        UserRecords, DirectMessage.sender_id == UserRecords.user_id
    ).where(
        DirectMessage.receiver_id == current_user.user_id,
        DirectMessage.is_read == False
    ).order_by(desc(DirectMessage.sent_at))
    
    result = await db.execute(stmt)
    rows = result.all()
    
    response = []
    for msg, sender_name in rows:
        response.append({
            "message_id": str(msg.message_id),
            "sender_id": str(msg.sender_id),
            "sender_name": sender_name,
            "receiver_id": str(msg.receiver_id),
            "content": msg.content,
            "is_read": msg.is_read,
            "sent_at": msg.sent_at
        })
    
    return response

async def get_unread_count_service(current_user: UserRecords, db: AsyncSession):
    """
    Get unread message count per contact, per group, and totals.
    """
    from sqlalchemy import func

    # Get unread count for direct messages grouped by sender
    stmt = select(
        DirectMessage.sender_id,
        UserRecords.username,
        func.count(DirectMessage.message_id).label('unread_count'),
        func.max(DirectMessage.sent_at).label('last_message_at')
    ).join(
        UserRecords, DirectMessage.sender_id == UserRecords.user_id
    ).where(
        DirectMessage.receiver_id == current_user.user_id,
        DirectMessage.is_read == False
    ).group_by(
        DirectMessage.sender_id, UserRecords.username
    ).order_by(desc('last_message_at'))

    result = await db.execute(stmt)
    rows = result.all()

    contacts_with_unread = []
    total_unread = 0

    for sender_id, sender_name, count, last_msg_at in rows:
        contacts_with_unread.append({
            "contact_id": str(sender_id),
            "contact_name": sender_name,
            "unread_count": count,
            "last_message_at": last_msg_at
        })
        total_unread += count

    # Get unread count for group messages
    # For each group user is member of, count messages sent after their last_read_at
    groups_with_unread = []
    total_group_unread = 0

    # Get all groups user is member of with their last_read_at
    member_stmt = select(GroupMember, GroupChat).join(
        GroupChat, GroupMember.group_id == GroupChat.group_id
    ).where(GroupMember.user_id == current_user.user_id)

    member_result = await db.execute(member_stmt)
    memberships = member_result.all()

    for membership, group in memberships:
        # Count messages in this group sent after last_read_at (excluding user's own messages)
        unread_stmt = select(
            func.count(GroupMessage.message_id).label('unread_count'),
            func.max(GroupMessage.sent_at).label('last_message_at')
        ).where(
            GroupMessage.group_id == group.group_id,
            GroupMessage.sent_at > membership.last_read_at,
            GroupMessage.sender_id != current_user.user_id
        )

        unread_result = await db.execute(unread_stmt)
        unread_row = unread_result.first()

        unread_count = unread_row.unread_count or 0
        last_msg_at = unread_row.last_message_at

        if unread_count > 0:
            groups_with_unread.append({
                "group_id": str(group.group_id),
                "group_name": group.name,
                "unread_count": unread_count,
                "last_message_at": last_msg_at
            })
            total_group_unread += unread_count

    # Sort groups by last_message_at descending
    groups_with_unread.sort(key=lambda x: x['last_message_at'] or datetime.min, reverse=True)

    return {
        "total_unread": total_unread,
        "contacts_with_unread": contacts_with_unread,
        "groups_with_unread": groups_with_unread,
        "total_group_unread": total_group_unread
    }

async def mark_messages_as_read_service(message_ids: list, current_user: UserRecords, db: AsyncSession):
    """
    Mark specific messages as read.
    """
    uuids = []
    for msg_id in message_ids:
        try:
            uuids.append(UUID(msg_id))
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid message ID: {msg_id}")
    
    # Update only messages received by current user
    stmt = select(DirectMessage).where(
        DirectMessage.message_id.in_(uuids),
        DirectMessage.receiver_id == current_user.user_id
    )
    
    result = await db.execute(stmt)
    messages = result.scalars().all()
    
    if not messages:
        raise HTTPException(status_code=404, detail="No messages found to mark as read")
    
    marked_count = 0
    for message in messages:
        if not message.is_read:
            message.is_read = True
            marked_count += 1
    
    await db.commit()
    
    logger.info(f"User {current_user.user_id} marked {marked_count} messages as read")
    return {"message": f"Marked {marked_count} message(s) as read", "marked_count": marked_count}

async def mark_all_from_contact_as_read_service(contact_id: str, current_user: UserRecords, db: AsyncSession):
    """
    Mark all unread messages from a specific contact as read.
    """
    try:
        contact_uuid = UUID(contact_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid contact ID")
    
    # Update all unread messages from this contact
    stmt = select(DirectMessage).where(
        DirectMessage.sender_id == contact_uuid,
        DirectMessage.receiver_id == current_user.user_id,
        DirectMessage.is_read == False
    )
    
    result = await db.execute(stmt)
    messages = result.scalars().all()
    
    marked_count = 0
    for message in messages:
        message.is_read = True
        marked_count += 1
    
    await db.commit()
    
    logger.info(f"User {current_user.user_id} marked {marked_count} messages from {contact_id} as read")
    return {"message": f"Marked {marked_count} message(s) as read", "marked_count": marked_count}

async def mark_group_as_read_service(group_id: str, current_user: UserRecords, db: AsyncSession):
    """
    Mark all messages in a group as read by updating the user's last_read_at timestamp.
    """
    try:
        group_uuid = UUID(group_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid group ID")

    # Find user's membership in this group
    member_result = await db.execute(select(GroupMember).where(
        GroupMember.group_id == group_uuid,
        GroupMember.user_id == current_user.user_id
    ))
    membership = member_result.scalar_one_or_none()

    if not membership:
        raise HTTPException(status_code=404, detail="You are not a member of this group")

    # Update last_read_at to current database time (use func.now() for consistency with sent_at)
    from sqlalchemy import update
    await db.execute(
        update(GroupMember)
        .where(GroupMember.id == membership.id)
        .values(last_read_at=func.now())
    )
    await db.commit()

    logger.info(f"User {current_user.user_id} marked group {group_id} as read")
    return {"message": "Group marked as read", "group_id": group_id}

async def add_group_members_service(group_id: str, user_ids: list, current_user: UserRecords, db: AsyncSession):
    """
    Add new members to a group. Only admins can add members.
    """
    try:
        group_uuid = UUID(group_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid group ID")
    
    # Check if current user is admin
    admin_check = await db.execute(select(GroupMember).where(
        GroupMember.group_id == group_uuid,
        GroupMember.user_id == current_user.user_id,
        GroupMember.role == GroupRole.Admin
    ))
    if not admin_check.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Only group admins can add members")
    
    # Verify group exists
    group_check = await db.execute(select(GroupChat).where(GroupChat.group_id == group_uuid))
    if not group_check.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Group not found")
    
    added_members = []
    already_members = []
    invalid_users = []
    
    for user_id in user_ids:
        try:
            user_uuid = UUID(user_id)
            
            # Check if user exists
            user_check = await db.execute(select(UserRecords).where(UserRecords.user_id == user_uuid))
            user = user_check.scalar_one_or_none()
            if not user:
                invalid_users.append(user_id)
                continue
            
            # Check if already a member
            member_check = await db.execute(select(GroupMember).where(
                GroupMember.group_id == group_uuid,
                GroupMember.user_id == user_uuid
            ))
            if member_check.scalar_one_or_none():
                already_members.append(user.username)
                continue
            
            # Add as member
            new_member = GroupMember(
                group_id=group_uuid,
                user_id=user_uuid,
                role=GroupRole.Member
            )
            db.add(new_member)
            added_members.append(user.username)
            
        except ValueError:
            invalid_users.append(user_id)
    
    await db.commit()
    
    return {
        "message": f"Added {len(added_members)} member(s) to the group",
        "added_members": added_members,
        "already_members": already_members,
        "invalid_users": invalid_users
    }

async def remove_group_member_service(group_id: str, user_id: str, current_user: UserRecords, db: AsyncSession):
    """
    Remove a member from group. Only admins can remove members.
    """
    try:
        group_uuid = UUID(group_id)
        target_user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")
    
    # Check if current user is admin
    admin_check = await db.execute(select(GroupMember).where(
        GroupMember.group_id == group_uuid,
        GroupMember.user_id == current_user.user_id,
        GroupMember.role == GroupRole.Admin
    ))
    if not admin_check.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Only group admins can remove members")
    
    # Don't allow removing yourself
    if target_user_uuid == current_user.user_id:
        raise HTTPException(status_code=400, detail="Cannot remove yourself. Use leave group endpoint instead")
    
    # Find the member to remove
    member_result = await db.execute(select(GroupMember).where(
        GroupMember.group_id == group_uuid,
        GroupMember.user_id == target_user_uuid
    ))
    member = member_result.scalar_one_or_none()
    
    if not member:
        raise HTTPException(status_code=404, detail="Member not found in this group")
    
    await db.delete(member)
    await db.commit()
    
    logger.info(f"User {user_id} removed from group {group_id} by {current_user.user_id}")
    return {"message": "Member removed from group successfully"}

async def change_group_role_service(group_id: str, user_id: str, new_role: str, current_user: UserRecords, db: AsyncSession):
    """
    Change a member's role (promote to admin or demote to member). Only admins can change roles.
    """
    try:
        group_uuid = UUID(group_id)
        target_user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")
    
    # Check if current user is admin
    admin_check = await db.execute(select(GroupMember).where(
        GroupMember.group_id == group_uuid,
        GroupMember.user_id == current_user.user_id,
        GroupMember.role == GroupRole.Admin
    ))
    if not admin_check.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Only group admins can change roles")
    
    # Find the member
    member_result = await db.execute(select(GroupMember).where(
        GroupMember.group_id == group_uuid,
        GroupMember.user_id == target_user_uuid
    ))
    member = member_result.scalar_one_or_none()
    
    if not member:
        raise HTTPException(status_code=404, detail="Member not found in this group")
    
    # Convert string to enum
    role_enum = GroupRole.Admin if new_role == "Admin" else GroupRole.Member
    
    if member.role == role_enum:
        raise HTTPException(status_code=400, detail=f"User is already a {new_role}")
    
    member.role = role_enum
    await db.commit()
    
    action = "promoted to admin" if role_enum == GroupRole.Admin else "demoted to member"
    logger.info(f"User {user_id} {action} in group {group_id} by {current_user.user_id}")
    return {"message": f"User {action} successfully", "new_role": new_role}

async def leave_group_service(group_id: str, current_user: UserRecords, db: AsyncSession):
    """
    Leave a group. If last admin leaves, group is deleted.
    """
    try:
        group_uuid = UUID(group_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid group ID")
    
    # Find user's membership
    member_result = await db.execute(select(GroupMember).where(
        GroupMember.group_id == group_uuid,
        GroupMember.user_id == current_user.user_id
    ))
    member = member_result.scalar_one_or_none()
    
    if not member:
        raise HTTPException(status_code=404, detail="You are not a member of this group")
    
    # Check if user is admin
    if member.role == GroupRole.Admin:
        # Count total admins
        admin_count_result = await db.execute(select(GroupMember).where(
            GroupMember.group_id == group_uuid,
            GroupMember.role == GroupRole.Admin
        ))
        admin_count = len(admin_count_result.scalars().all())
        
        if admin_count == 1:
            # Last admin - check if there are other members
            member_count_result = await db.execute(select(GroupMember).where(
                GroupMember.group_id == group_uuid
            ))
            total_members = len(member_count_result.scalars().all())
            
            if total_members > 1:
                raise HTTPException(
                    status_code=400, 
                    detail="You are the last admin. Please promote another member to admin before leaving or delete the group"
                )
    
    await db.delete(member)
    await db.commit()
    
    logger.info(f"User {current_user.user_id} left group {group_id}")
    return {"message": "Left group successfully"}

async def delete_group_service(group_id: str, current_user: UserRecords, db: AsyncSession):
    """
    Delete a group. Only group creator or admins can delete.
    """
    try:
        group_uuid = UUID(group_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid group ID")
    
    # Get group
    group_result = await db.execute(select(GroupChat).where(GroupChat.group_id == group_uuid))
    group = group_result.scalar_one_or_none()
    
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Check if user is admin or creator
    if group.created_by != current_user.user_id:
        admin_check = await db.execute(select(GroupMember).where(
            GroupMember.group_id == group_uuid,
            GroupMember.user_id == current_user.user_id,
            GroupMember.role == GroupRole.Admin
        ))
        if not admin_check.scalar_one_or_none():
            raise HTTPException(status_code=403, detail="Only group creator or admins can delete the group")
    
    # Delete group (cascade will delete members and messages)
    await db.delete(group)
    await db.commit()
    
    logger.info(f"Group {group_id} deleted by {current_user.user_id}")
    return {"message": "Group deleted successfully"}

async def get_group_members_service(group_id: str, current_user: UserRecords, db: AsyncSession):
    """
    Get all members of a group with their roles.
    """
    try:
        group_uuid = UUID(group_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid group ID")
    
    # Check if user is member
    member_check = await db.execute(select(GroupMember).where(
        GroupMember.group_id == group_uuid,
        GroupMember.user_id == current_user.user_id
    ))
    if not member_check.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="You are not a member of this group")
    
    # Get all members
    stmt = select(GroupMember, UserRecords).join(
        UserRecords, GroupMember.user_id == UserRecords.user_id
    ).where(GroupMember.group_id == group_uuid)
    
    result = await db.execute(stmt)
    rows = result.all()
    
    members = []
    for member, user in rows:
        members.append({
            "user_id": str(user.user_id),
            "username": user.username,
            "email": user.email,
            "role": member.role.value,
            "joined_at": member.joined_at
        })
    
    return members

async def update_group_info_service(group_id: str, name: str, description: str, current_user: UserRecords, db: AsyncSession):
    """
    Update group name and/or description. Only admins can update.
    """
    try:
        group_uuid = UUID(group_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid group ID")
    
    # Check if user is admin
    admin_check = await db.execute(select(GroupMember).where(
        GroupMember.group_id == group_uuid,
        GroupMember.user_id == current_user.user_id,
        GroupMember.role == GroupRole.Admin
    ))
    if not admin_check.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Only group admins can update group info")
    
    # Get group
    group_result = await db.execute(select(GroupChat).where(GroupChat.group_id == group_uuid))
    group = group_result.scalar_one_or_none()
    
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Update fields
    updated_fields = []
    if name is not None:
        group.name = name
        updated_fields.append("name")
    if description is not None:
        group.description = description
        updated_fields.append("description")
    
    if not updated_fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    await db.commit()
    await db.refresh(group)
    
    logger.info(f"Group {group_id} info updated by {current_user.user_id}: {', '.join(updated_fields)}")
    return group

