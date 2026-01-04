import { createFileRoute } from '@tanstack/react-router';
import { ChatView } from '@/features/chat/components/chat-view';

export const Route = createFileRoute('/_app/chat')({
  component: ChatPage,
});

function ChatPage() {
  return <ChatView />;
}
