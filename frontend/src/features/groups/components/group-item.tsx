import { useNavigate } from '@tanstack/react-router';
import { MessageSquare, MoreVertical, LogOut, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useChatStore } from '@/stores/chat.store';
import { useAuthStore } from '@/stores/auth.store';
import { useLeaveGroup, useDeleteGroup } from '../hooks';
import type { Group } from '../types';

interface GroupItemProps {
  group: Group;
}

/**
 * Single group item with actions
 */
function GroupItem({ group }: GroupItemProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setActiveGroup = useChatStore((s) => s.setActiveGroup);
  const leaveGroup = useLeaveGroup();
  const deleteGroup = useDeleteGroup();

  const isOwner = group.created_by === user?.user_id;

  const handleOpenChat = () => {
    setActiveGroup(group.group_id);
    navigate({ to: '/chat' });
  };

  const handleLeave = () => {
    if (confirm(`Leave "${group.name}"?`)) {
      leaveGroup.mutate(group.group_id);
    }
  };

  const handleDelete = () => {
    if (confirm(`Delete "${group.name}"? This cannot be undone.`)) {
      deleteGroup.mutate(group.group_id);
    }
  };

  return (
    <div
      onClick={handleOpenChat}
      className="flex cursor-pointer items-center justify-between rounded-lg p-3 hover:bg-[hsl(var(--secondary))] transition-colors"
    >
      {/* Group info */}
      <div className="flex items-center gap-3">
        <UserAvatar name={group.name} size="md" />
        <div>
          <h3 className="font-medium">{group.name}</h3>
          {group.description && (
            <p className="text-sm text-[hsl(var(--foreground-muted))]">
              {group.description}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleOpenChat}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Open chat
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Users className="mr-2 h-4 w-4" />
              View members
            </DropdownMenuItem>
            {!isOwner && (
              <DropdownMenuItem onClick={handleLeave} className="text-[hsl(var(--destructive))]">
                <LogOut className="mr-2 h-4 w-4" />
                Leave group
              </DropdownMenuItem>
            )}
            {isOwner && (
              <DropdownMenuItem onClick={handleDelete} className="text-[hsl(var(--destructive))]">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete group
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export { GroupItem };
