import { useState, useMemo, useCallback, useEffect } from 'react';
import { Users, MoreVertical, ArrowLeft, Info, UsersRound, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MessageInput } from '@/features/chat/components/message-input';
import { useAuthStore } from '@/stores/auth.store';
import { useChatStore } from '@/stores/chat.store';
import { useGroups, useGroupMessages, useSendGroupMessage, useGroupMessageSubscription, useLeaveGroup } from '../hooks';
import { useMarkGroupAsRead } from '@/features/chat/hooks';
import { GroupMessageList } from './group-message-list';
import { GroupMembersDialog } from './group-members-dialog';
import { cn } from '@/lib/utils';

interface GroupChatWindowProps {
  onBack?: () => void;
}

/**
 * Group chat window with immersive full-screen design
 */
function GroupChatWindow({ onBack }: GroupChatWindowProps) {
  const [showMembersDialog, setShowMembersDialog] = useState(false);

  const user = useAuthStore((s) => s.user);
  const activeGroupId = useChatStore((s) => s.activeGroupId);
  const setActiveGroup = useChatStore((s) => s.setActiveGroup);

  // Fetch groups to get the active group's info
  const { data: groups } = useGroups();
  const activeGroup = groups?.find((g) => g.group_id === activeGroupId);

  // Fetch messages
  const messagesQuery = useGroupMessages(activeGroupId);
  const sendMessage = useSendGroupMessage(activeGroupId || '');
  const leaveGroup = useLeaveGroup();
  const markGroupAsRead = useMarkGroupAsRead();

  // Subscribe to real-time group messages via WebSocket
  useGroupMessageSubscription();

  // Mark group as read when opening
  useEffect(() => {
    if (activeGroupId) {
      markGroupAsRead.mutate(activeGroupId);
    }
  }, [activeGroupId]);

  const handleLeaveGroup = () => {
    if (!activeGroupId) return;
    leaveGroup.mutate(activeGroupId, {
      onSuccess: () => {
        setActiveGroup(null);
        onBack?.();
      },
    });
  };

  // Flatten paginated messages and reverse for chronological order
  const messages = useMemo(() => {
    if (!messagesQuery.data?.pages) return [];
    return messagesQuery.data.pages.flat().reverse();
  }, [messagesQuery.data?.pages]);

  // Handle sending message
  const handleSend = useCallback(
    (content: string) => {
      if (!activeGroupId) return;
      sendMessage.mutate(content);
    },
    [activeGroupId, sendMessage]
  );

  // No group selected
  if (!activeGroupId) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-[hsl(var(--background))]">
        <div className="text-center px-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-purple flex items-center justify-center opacity-20">
            <UsersRound className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Select a Group</h2>
          <p className="text-[hsl(var(--foreground-muted))]">
            Choose a group to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-[hsl(var(--background))]">
      {/* Header */}
      <header className={cn(
        'flex items-center justify-between px-4 sm:px-6 py-4',
        'bg-[hsl(var(--card))] border-b border-[hsl(var(--border))]',
        'sticky top-0 z-10'
      )}>
        <div className="flex items-center gap-3">
          {/* Back button on mobile */}
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="lg:hidden w-10 h-10 rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}

          {/* Group icon and name */}
          <div className="w-12 h-12 rounded-xl bg-gradient-purple flex items-center justify-center">
            <UsersRound className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">{activeGroup?.name || 'Loading...'}</h2>
            <p className="text-xs text-[hsl(var(--foreground-muted))]">
              {activeGroup?.description || 'Group chat'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-xl"
            onClick={() => setShowMembersDialog(true)}
          >
            <Users className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-xl"
              >
                <Info className="h-5 w-5 sm:hidden" />
                <MoreVertical className="h-5 w-5 hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuItem
                className="rounded-lg cursor-pointer"
                onClick={() => setShowMembersDialog(true)}
              >
                <Users className="w-4 h-4 mr-2" />
                View Members
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="rounded-lg cursor-pointer text-[hsl(var(--destructive))] focus:text-[hsl(var(--destructive))]"
                onClick={handleLeaveGroup}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Leave Group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Members Dialog */}
      {activeGroupId && (
        <GroupMembersDialog
          groupId={activeGroupId}
          groupName={activeGroup?.name || 'Group'}
          open={showMembersDialog}
          onOpenChange={setShowMembersDialog}
        />
      )}

      {/* Messages area */}
      {messagesQuery.isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-purple flex items-center justify-center opacity-50">
              <UsersRound className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold mb-1">Start the conversation</h3>
            <p className="text-sm text-[hsl(var(--foreground-muted))]">
              Send a message to {activeGroup?.name || 'this group'}
            </p>
          </div>
        </div>
      ) : (
        <GroupMessageList
          messages={messages}
          currentUserId={user?.user_id || ''}
        />
      )}

      {/* Input */}
      <MessageInput onSend={handleSend} disabled={sendMessage.isPending} />
    </div>
  );
}

export { GroupChatWindow };
