import { useMemo, useCallback, useEffect } from 'react';
import { Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/common';
import { EmptyState } from '@/components/common';
import { SimpleMessageList } from './message-list';
import { MessageInput } from './message-input';
import { useDirectMessages, useSendDirectMessage, useMarkAsRead, useMessageSubscription } from '../hooks';
import { useAuthStore } from '@/stores/auth.store';
import { useChatStore } from '@/stores/chat.store';
import { useContacts } from '@/features/contacts/hooks';

interface ChatWindowProps {
  onBack?: () => void;
}

/**
 * Main chat window with header, messages, and input
 */
function ChatWindow({ onBack }: ChatWindowProps) {
  const user = useAuthStore((s) => s.user);
  const activeContactId = useChatStore((s) => s.activeContactId);

  // Fetch contacts to get the active contact's info
  const { data: contacts } = useContacts();
  const activeContact = contacts?.find((c) => c.contact_id === activeContactId);

  // Fetch messages
  const messagesQuery = useDirectMessages(activeContactId);
  const sendMessage = useSendDirectMessage();
  const markAsRead = useMarkAsRead();

  // Subscribe to real-time messages via WebSocket
  useMessageSubscription(activeContactId);

  // Mark messages as read when opening a conversation
  useEffect(() => {
    if (activeContactId) {
      markAsRead.mutate(activeContactId);
    }
  }, [activeContactId]);

  // Flatten paginated messages and reverse for chronological order (oldest first)
  const messages = useMemo(() => {
    if (!messagesQuery.data?.pages) return [];
    // API returns newest first, reverse for display (oldest at top, newest at bottom)
    return messagesQuery.data.pages.flat().reverse();
  }, [messagesQuery.data?.pages]);

  // Convert to format expected by MessageList
  const formattedMessages = useMemo(() => {
    return messages.map((msg) => ({
      id: msg.message_id,
      content: msg.content,
      sender_id: msg.sender_id,
      receiver_id: msg.receiver_id,
      created_at: msg.sent_at,
      is_read: msg.is_read,
    }));
  }, [messages]);

  // Handle sending message
  const handleSend = useCallback(
    (content: string) => {
      if (!activeContactId) return;
      sendMessage.mutate({
        receiver_id: activeContactId,
        content,
      });
    },
    [activeContactId, sendMessage]
  );

  // No conversation selected
  if (!activeContactId) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[hsl(var(--background))]">
        <EmptyState
          title="Select a conversation"
          description="Choose a contact from the list to start messaging"
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
          <UserAvatar name={activeContact?.username || 'Contact'} size="sm" />
          <div>
            <h2 className="font-semibold">{activeContact?.username || 'Loading...'}</h2>
            <p className="text-xs text-[hsl(var(--foreground-muted))]">
              {activeContact?.email || ''}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
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
      ) : formattedMessages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            title="No messages yet"
            description="Send a message to start the conversation"
          />
        </div>
      ) : (
        <SimpleMessageList
          messages={formattedMessages}
          currentUserId={user?.user_id || ''}
          isGroup={false}
        />
      )}

      {/* Input */}
      <MessageInput onSend={handleSend} disabled={sendMessage.isPending} />
    </div>
  );
}

export { ChatWindow };
