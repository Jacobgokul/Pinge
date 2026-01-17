import { useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Phone, Video, MoreVertical, ArrowLeft, Info, User, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/common';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { SimpleMessageList } from './message-list';
import { MessageInput } from './message-input';
import { useDirectMessages, useSendDirectMessage, useMarkAsRead, useMessageSubscription } from '../hooks';
import { useAuthStore } from '@/stores/auth.store';
import { useChatStore } from '@/stores/chat.store';
import { useContacts, useRemoveContact } from '@/features/contacts/hooks';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  onBack?: () => void;
}

/**
 * Main chat window with immersive full-screen design
 */
function ChatWindow({ onBack }: ChatWindowProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const activeContactId = useChatStore((s) => s.activeContactId);
  const setActiveContact = useChatStore((s) => s.setActiveContact);

  // Fetch contacts to get the active contact's info
  const { data: contacts } = useContacts();
  const activeContact = contacts?.find((c) => c.contact_id === activeContactId);

  // Fetch messages
  const messagesQuery = useDirectMessages(activeContactId);
  const sendMessage = useSendDirectMessage();
  const markAsRead = useMarkAsRead();
  const removeContact = useRemoveContact();

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
      <div className="flex h-full w-full flex-col items-center justify-center bg-[hsl(var(--background))]">
        <div className="text-center px-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-primary flex items-center justify-center opacity-20">
            <span className="text-4xl font-bold text-white">P</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Welcome to Pinge</h2>
          <p className="text-[hsl(var(--foreground-muted))]">
            Select a conversation to start messaging
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

          {/* Avatar and name */}
          <UserAvatar name={activeContact?.username || 'Contact'} size="md" />
          <div>
            <h2 className="font-semibold text-lg">{activeContact?.username || 'Loading...'}</h2>
            <p className="text-xs text-[hsl(var(--foreground-muted))]">
              {activeContact?.email || 'Online'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-xl hidden sm:flex"
            title="Voice call (coming soon)"
          >
            <Phone className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-xl hidden sm:flex"
            title="Video call (coming soon)"
          >
            <Video className="h-5 w-5" />
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
                onClick={() => navigate({ to: '/contacts' })}
              >
                <User className="w-4 h-4 mr-2" />
                View Contact
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="rounded-lg cursor-pointer text-[hsl(var(--destructive))] focus:text-[hsl(var(--destructive))]"
                onClick={() => {
                  if (!activeContactId) return;
                  removeContact.mutate(activeContactId, {
                    onSuccess: () => {
                      setActiveContact(null);
                      onBack?.();
                    },
                  });
                }}
              >
                <UserMinus className="w-4 h-4 mr-2" />
                Remove Contact
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Messages area */}
      {messagesQuery.isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : formattedMessages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[hsl(var(--secondary))] flex items-center justify-center">
              <UserAvatar name={activeContact?.username || 'User'} size="lg" />
            </div>
            <h3 className="font-semibold mb-1">Start a conversation</h3>
            <p className="text-sm text-[hsl(var(--foreground-muted))]">
              Send a message to {activeContact?.username || 'this contact'}
            </p>
          </div>
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
