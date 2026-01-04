import { useMemo, useCallback } from 'react';
import { Users, MoreVertical, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/common';
import { EmptyState } from '@/components/common';
import { MessageInput } from '@/features/chat/components/message-input';
import { useAuthStore } from '@/stores/auth.store';
import { useChatStore } from '@/stores/chat.store';
import { useGroups, useGroupMessages, useSendGroupMessage, useGroupMessageSubscription } from '../hooks';
import { GroupMessageList } from './group-message-list';

interface GroupChatWindowProps {
  onBack?: () => void;
}

/**
 * Group chat window with header, messages, and input
 */
function GroupChatWindow({ onBack }: GroupChatWindowProps) {
  const user = useAuthStore((s) => s.user);
  const activeGroupId = useChatStore((s) => s.activeGroupId);

  // Fetch groups to get the active group's info
  const { data: groups } = useGroups();
  const activeGroup = groups?.find((g) => g.group_id === activeGroupId);

  // Fetch messages
  const messagesQuery = useGroupMessages(activeGroupId);
  const sendMessage = useSendGroupMessage(activeGroupId || '');

  // Subscribe to real-time group messages via WebSocket
  useGroupMessageSubscription();

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
      <div className="flex h-full flex-col items-center justify-center bg-[hsl(var(--background))]">
        <EmptyState
          title="Select a group"
          description="Choose a group from the list to start messaging"
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[hsl(var(--background))]">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4">
        <div className="flex items-center gap-3">
          {/* Back button on mobile */}
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="lg:hidden">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}

          {/* Avatar and name */}
          <UserAvatar name={activeGroup?.name || 'Group'} size="sm" />
          <div>
            <h2 className="font-semibold">{activeGroup?.name || 'Loading...'}</h2>
            <p className="text-xs text-[hsl(var(--foreground-muted))]">
              {activeGroup?.description || 'Group chat'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon">
            <Users className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Messages area */}
      {messagesQuery.isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            title="No messages yet"
            description="Send a message to start the conversation"
          />
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
