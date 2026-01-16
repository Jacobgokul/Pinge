import { useNavigate } from '@tanstack/react-router';
import { MessageSquare, MoreVertical, LogOut, Trash2, Users, UsersRound, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface GroupCardProps {
  group: Group;
}

/**
 * Group card with modern design
 */
function GroupCard({ group }: GroupCardProps) {
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
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-4 transition-all duration-200 hover:shadow-lg hover:border-[hsl(var(--primary)/0.3)] group">
      {/* Header with icon and actions */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-purple flex items-center justify-center">
          <UsersRound className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center gap-1">
          {isOwner && (
            <div className="w-6 h-6 rounded-md bg-[hsl(var(--accent-gold)/0.1)] flex items-center justify-center" title="Owner">
              <Crown className="w-3.5 h-3.5 text-[hsl(var(--accent-gold))]" />
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={handleOpenChat} className="rounded-lg">
                <MessageSquare className="mr-2 h-4 w-4" />
                Open chat
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg">
                <Users className="mr-2 h-4 w-4" />
                View members
              </DropdownMenuItem>
              {!isOwner && (
                <DropdownMenuItem
                  onClick={handleLeave}
                  className="rounded-lg text-[hsl(var(--destructive))]"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Leave group
                </DropdownMenuItem>
              )}
              {isOwner && (
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="rounded-lg text-[hsl(var(--destructive))]"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete group
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Group info */}
      <div className="mb-4">
        <h3 className="font-semibold text-lg truncate">{group.name}</h3>
        <p className="text-sm text-[hsl(var(--foreground-muted))] line-clamp-2 min-h-[2.5rem]">
          {group.description || 'No description'}
        </p>
      </div>

      {/* Quick action */}
      <Button
        onClick={handleOpenChat}
        className="w-full h-10 rounded-xl bg-gradient-primary hover:opacity-90 text-white font-medium transition-all duration-200"
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        Open Chat
      </Button>
    </div>
  );
}

export { GroupCard };
