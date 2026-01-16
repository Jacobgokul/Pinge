import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
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
import { cn } from '@/lib/utils';

interface ConversationListProps {
  onSelect?: () => void;
}

type FilterType = 'all' | 'direct' | 'groups';

/**
 * List of conversations with filter tabs
 */
function ConversationList({ onSelect }: ConversationListProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const { activeContactId, activeGroupId, setActiveContact, setActiveGroup } = useChatStore();

  // Fetch contacts, groups, and unread counts from API
  const { data: contacts, isLoading: contactsLoading } = useContacts();
  const { data: groups, isLoading: groupsLoading } = useGroups();
  const { data: unreadData } = useUnreadCount();

  // Create maps for unread counts
  const unreadMap = new Map(
    unreadData?.contacts_with_unread?.map((item) => [item.contact_id, item]) || []
  );
  const groupUnreadMap = new Map(
    unreadData?.groups_with_unread?.map((item) => [item.group_id, item]) || []
  );

  // Filter contacts by search
  const filteredContacts =
    contacts?.filter(
      (c) =>
        c.username.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    ) || [];

  // Filter groups by search
  const filteredGroups =
    groups?.filter(
      (g) =>
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

  // Apply filter
  const showContacts = filter === 'all' || filter === 'direct';
  const showGroups = filter === 'all' || filter === 'groups';

  const hasConversations =
    (showContacts && filteredContacts.length > 0) || (showGroups && filteredGroups.length > 0);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'direct', label: 'Direct' },
    { key: 'groups', label: 'Groups' },
  ];

  return (
    <div className="flex h-full flex-col bg-[hsl(var(--background))]">
      {/* Header */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Chats</h1>
          <Button
            size="icon"
            className="w-10 h-10 rounded-xl bg-gradient-primary hover:opacity-90"
          >
            <Plus className="h-5 w-5 text-white" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--foreground-muted))]" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 pl-11 rounded-xl bg-[hsl(var(--card))] border-[hsl(var(--border))] focus:border-[hsl(var(--primary))]"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-4">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                filter === f.key
                  ? 'bg-gradient-primary text-white'
                  : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation list */}
      <ScrollArea className="flex-1 px-4 sm:px-5 pb-4">
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
          <div className="space-y-2">
            {/* Groups */}
            {showGroups &&
              filteredGroups.map((group) => {
                const groupUnread = groupUnreadMap.get(group.group_id);
                const unreadCount = groupUnread?.unread_count || 0;
                return (
                  <ConversationItem
                    key={`group-${group.group_id}`}
                    id={group.group_id}
                    name={group.name}
                    lastMessage={unreadCount > 0 ? `${unreadCount} new messages` : (group.description || 'Group chat')}
                    lastMessageTime={groupUnread?.last_message_at || undefined}
                    isGroup
                    isActive={activeGroupId === group.group_id}
                    unreadCount={unreadCount}
                    onClick={() => handleSelectGroup(group.group_id)}
                  />
                );
              })}

            {/* Contacts */}
            {showContacts &&
              filteredContacts.map((contact) => {
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
