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
 * Message input with modern rounded design
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
    <div className="p-4 sm:p-5 bg-[hsl(var(--card))] border-t border-[hsl(var(--border))]">
      <div className="flex items-end gap-2 sm:gap-3">
        {/* Attachment button */}
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 w-10 h-10 rounded-xl hover:bg-[hsl(var(--secondary))]"
          disabled={disabled}
        >
          <Paperclip className="h-5 w-5 text-[hsl(var(--foreground-muted))]" />
        </Button>

        {/* Input area */}
        <div
          className={cn(
            'flex-1 flex items-end gap-2',
            'rounded-2xl bg-[hsl(var(--secondary))] px-4 py-2.5',
            'border border-transparent',
            'focus-within:border-[hsl(var(--primary)/0.3)] focus-within:bg-[hsl(var(--background))]',
            'transition-all duration-200'
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
              'flex-1 resize-none bg-transparent text-[0.9375rem]',
              'placeholder:text-[hsl(var(--foreground-muted))]',
              'focus:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'min-h-[24px] max-h-[150px]'
            )}
          />

          {/* Emoji button */}
          <button
            type="button"
            className="shrink-0 p-1 rounded-lg hover:bg-[hsl(var(--background))] transition-colors"
            disabled={disabled}
          >
            <Smile className="h-5 w-5 text-[hsl(var(--foreground-muted))]" />
          </button>
        </div>

        {/* Send button */}
        <Button
          size="icon"
          className={cn(
            'shrink-0 w-10 h-10 rounded-xl transition-all duration-200',
            content.trim()
              ? 'bg-gradient-primary hover:opacity-90'
              : 'bg-[hsl(var(--secondary))]'
          )}
          onClick={handleSubmit}
          disabled={disabled || !content.trim()}
        >
          <Send
            className={cn(
              'h-5 w-5 transition-colors',
              content.trim() ? 'text-white' : 'text-[hsl(var(--foreground-muted))]'
            )}
          />
        </Button>
      </div>
    </div>
  );
}

export { MessageInput };
