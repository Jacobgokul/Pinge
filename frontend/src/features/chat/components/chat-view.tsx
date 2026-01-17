import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ConversationList } from './conversation-list';
import { ChatWindow } from './chat-window';
import { GroupChatWindow } from '@/features/groups/components/group-chat-window';
import { useChatStore } from '@/stores/chat.store';

/**
 * Main chat view with responsive layout
 * Shows conversation list and chat window side by side on desktop
 * Shows one or the other on mobile with navigation
 */
function ChatView() {
  const [showChat, setShowChat] = useState(false);
  const activeContactId = useChatStore((s) => s.activeContactId);
  const activeGroupId = useChatStore((s) => s.activeGroupId);

  const hasActiveConversation = !!(activeContactId || activeGroupId);

  // Handle conversation selection on mobile
  const handleSelect = () => {
    setShowChat(true);
  };

  // Handle back navigation on mobile
  const handleBack = () => {
    setShowChat(false);
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] sm:h-[calc(100vh-7rem)]">
      {/* Conversation list - hidden on mobile when viewing chat */}
      <div
        className={cn(
          'w-full lg:w-[380px] xl:w-[420px]',
          'border-r border-[hsl(var(--border))]',
          showChat && hasActiveConversation ? 'hidden lg:block' : 'block'
        )}
      >
        <ConversationList onSelect={handleSelect} />
      </div>

      {/* Chat window - hidden on mobile when viewing list */}
      <div
        className={cn(
          'flex-1',
          !showChat && hasActiveConversation ? 'hidden lg:flex' : 'flex',
          !hasActiveConversation && 'hidden lg:flex'
        )}
      >
        {activeGroupId ? (
          <GroupChatWindow onBack={handleBack} />
        ) : (
          <ChatWindow onBack={handleBack} />
        )}
      </div>
    </div>
  );
}

export { ChatView };
