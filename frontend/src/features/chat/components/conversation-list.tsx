import { useState } from 'react';
import { Search, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner } from '@/components/common';
import { EmptyState } from '@/components/common';
import { ConversationItem } from './conversation-item';
import { useChatStore } from '@/stores/chat.store';
import { useContacts } from '@/features/contacts/hooks';
import { useGroups } from '@/features/groups/hooks';
import { useUnreadCount } from '../hooks';

interface ConversationListProps {
  onSelect?: () => void;
}

/**
 * List of conversations fetched from contacts API
 */
function ConversationList({ onSelect }: ConversationListProps) {
  const [search, setSearch] = useState('');
  const { activeContactId, activeGroupId, setActiveContact, setActiveGroup } = useChatStore();

  // Fetch contacts, groups, and unread counts from API
  const { data: contacts, isLoading: contactsLoading } = useContacts();
  const { data: groups, isLoading: groupsLoading } = useGroups();
  const { data: unreadData } = useUnreadCount();

  // Create a map of unread counts by contact
  const unreadMap = new Map(
    unreadData?.contacts_with_unread?.map((item) => [item.contact_id, item]) || []
  );

  // Filter contacts by search
  const filteredContacts = contacts?.filter((c) =>
    c.username.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  // Filter groups by search
  const filteredGroups = groups?.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    (g.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
  ) || [];

  const handleSelectContact = (contactId: string) => {
    setActiveContact(contactId);
    onSelect?.();
  };

  const handleSelectGroup = (groupId: string) => {
    setActiveGroup(groupId);
    onSelect?.();
  };

  const isLoading = contactsLoading || groupsLoading;
  const hasConversations = filteredContacts.length > 0 || filteredGroups.length > 0;

  return (
    <div className="flex h-full flex-col bg-[hsl(var(--card))]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-4">
        <h1 className="text-xl font-bold">Chats</h1>
        <Button variant="ghost" size="icon">
          <Edit className="h-5 w-5" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--foreground-muted))]" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversation list */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : !hasConversations ? (
          <EmptyState
            title="No conversations"
            description="Add contacts or create groups to start chatting"
          />
        ) : (
          <div className="space-y-1 p-2">
            {/* Groups */}
            {filteredGroups.map((group) => (
              <ConversationItem
                key={`group-${group.group_id}`}
                id={group.group_id}
                name={group.name}
                lastMessage={group.description || 'Group chat'}
                isGroup
                isActive={activeGroupId === group.group_id}
                onClick={() => handleSelectGroup(group.group_id)}
              />
            ))}

            {/* Contacts */}
            {filteredContacts.map((contact) => {
              const unread = unreadMap.get(contact.contact_id);
              return (
                <ConversationItem
                  key={`contact-${contact.contact_id}`}
                  id={contact.contact_id}
                  name={contact.username}
                  lastMessage={unread ? `${unread.unread_count} new messages` : undefined}
                  lastMessageTime={unread?.last_message_at || undefined}
                  unreadCount={unread?.unread_count || 0}
                  isOnline={false}
                  isActive={activeContactId === contact.contact_id}
                  onClick={() => handleSelectContact(contact.contact_id)}
                />
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

export { ConversationList };
