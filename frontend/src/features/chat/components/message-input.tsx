import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Message input with auto-resize textarea
 */
function MessageInput({ onSend, disabled = false, placeholder = 'Type a message...' }: MessageInputProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [content]);

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send on Enter, new line on Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <Button variant="ghost" size="icon" className="shrink-0" disabled={disabled}>
          <Paperclip className="h-5 w-5" />
        </Button>

        {/* Input area */}
        <div
          className={cn(
            'flex-1 rounded-2xl border border-[hsl(var(--input))] bg-transparent px-4 py-2',
            'focus-within:ring-2 focus-within:ring-[hsl(var(--ring))]'
          )}
        >
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              'w-full resize-none bg-transparent text-sm',
              'placeholder:text-[hsl(var(--foreground-muted))]',
              'focus:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          />
        </div>

        {/* Emoji button */}
        <Button variant="ghost" size="icon" className="shrink-0" disabled={disabled}>
          <Smile className="h-5 w-5" />
        </Button>

        {/* Send button */}
        <Button
          size="icon"
          className="shrink-0"
          onClick={handleSubmit}
          disabled={disabled || !content.trim()}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

export { MessageInput };
