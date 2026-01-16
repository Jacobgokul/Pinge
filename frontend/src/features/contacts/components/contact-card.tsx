import { MessageSquare, MoreVertical, Trash2, Mail } from 'lucide-react';
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

interface ContactCardProps {
  contact: Contact;
}

/**
 * Contact card with modern design
 */
function ContactCard({ contact }: ContactCardProps) {
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
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-4 transition-all duration-200 hover:shadow-lg hover:border-[hsl(var(--primary)/0.3)] group">
      {/* Header with avatar and actions */}
      <div className="flex items-start justify-between mb-3">
        <UserAvatar name={contact.username} size="lg" />
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
            <DropdownMenuItem onClick={handleStartChat} className="rounded-lg">
              <MessageSquare className="mr-2 h-4 w-4" />
              Send message
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleRemove}
              className="rounded-lg text-[hsl(var(--destructive))]"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove contact
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* User info */}
      <div className="mb-4">
        <h3 className="font-semibold text-lg truncate">{contact.username}</h3>
        <p className="text-sm text-[hsl(var(--foreground-muted))] flex items-center gap-1.5 truncate">
          <Mail className="w-3.5 h-3.5 shrink-0" />
          {contact.email}
        </p>
      </div>

      {/* Quick action */}
      <Button
        onClick={handleStartChat}
        className="w-full h-10 rounded-xl bg-gradient-primary hover:opacity-90 text-white font-medium transition-all duration-200"
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        Message
      </Button>
    </div>
  );
}

export { ContactCard };
