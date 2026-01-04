import { MessageSquare, MoreVertical, Trash2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useChatStore } from '@/stores/chat.store';
import { useRemoveContact } from '../hooks';
import type { Contact } from '../types';

interface ContactItemProps {
  contact: Contact;
}

/**
 * Single contact item with actions
 */
function ContactItem({ contact }: ContactItemProps) {
  const navigate = useNavigate();
  const setActiveContact = useChatStore((s) => s.setActiveContact);
  const removeContact = useRemoveContact();

  const handleStartChat = () => {
    setActiveContact(contact.contact_id);
    navigate({ to: '/chat' });
  };

  const handleRemove = () => {
    if (confirm(`Remove ${contact.username} from contacts?`)) {
      removeContact.mutate(contact.contact_id);
    }
  };

  return (
    <div
      onClick={handleStartChat}
      className="flex cursor-pointer items-center justify-between rounded-lg p-3 hover:bg-[hsl(var(--secondary))] transition-colors"
    >
      {/* User info */}
      <div className="flex items-center gap-3">
        <UserAvatar name={contact.username} size="md" />
        <div>
          <h3 className="font-medium">{contact.username}</h3>
          <p className="text-sm text-[hsl(var(--foreground-muted))]">{contact.email}</p>
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
            <DropdownMenuItem onClick={handleStartChat}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Send message
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRemove} className="text-[hsl(var(--destructive))]">
              <Trash2 className="mr-2 h-4 w-4" />
              Remove contact
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export { ContactItem };
