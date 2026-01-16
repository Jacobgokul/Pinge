import { useState } from 'react';
import { Search, Users, UserPlus, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner } from '@/components/common';
import { EmptyState } from '@/components/common';
import { ContactCard } from './contact-card';
import { ContactRequestItem } from './contact-request-item';
import { AddContactDialog } from './add-contact-dialog';
import { useContacts, useContactRequests } from '../hooks';
import { cn } from '@/lib/utils';

/**
 * Main contacts view with card grid layout
 */
function ContactsView() {
  const [search, setSearch] = useState('');
  const [showRequests, setShowRequests] = useState(false);

  const { data: contacts, isLoading: contactsLoading } = useContacts();
  const { data: requests, isLoading: requestsLoading } = useContactRequests();

  // Filter contacts by search
  const filteredContacts = contacts?.filter(
    (c) =>
      c.username.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const isLoading = contactsLoading || requestsLoading;
  const hasRequests = requests && requests.length > 0;

  return (
    <div className="flex h-full flex-col bg-[hsl(var(--background))]">
      {/* Header */}
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Contacts</h1>
          <div className="flex items-center gap-2">
            {/* Requests button */}
            {hasRequests && (
              <Button
                variant={showRequests ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'rounded-xl gap-2',
                  showRequests && 'bg-gradient-primary hover:opacity-90'
                )}
                onClick={() => setShowRequests(!showRequests)}
              >
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Requests</span>
                <span className="px-1.5 py-0.5 text-xs rounded-full bg-white/20">
                  {requests.length}
                </span>
              </Button>
            )}
            <AddContactDialog />
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--foreground-muted))]" />
          <Input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 pl-12 rounded-xl bg-[hsl(var(--card))] border-[hsl(var(--border))] focus:border-[hsl(var(--primary))]"
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 px-4 sm:px-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Pending requests section */}
            {showRequests && hasRequests && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-[hsl(var(--primary))]" />
                  </div>
                  <h2 className="font-semibold">Pending Requests</h2>
                  <span className="text-sm text-[hsl(var(--foreground-muted))]">
                    ({requests.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {requests.map((request) => (
                    <ContactRequestItem key={request.request_id} request={request} />
                  ))}
                </div>
              </div>
            )}

            {/* Contacts grid */}
            <div className="pb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[hsl(var(--accent-cyan)/0.1)] flex items-center justify-center">
                  <Users className="w-4 h-4 text-[hsl(var(--accent-cyan))]" />
                </div>
                <h2 className="font-semibold">All Contacts</h2>
                <span className="text-sm text-[hsl(var(--foreground-muted))]">
                  ({filteredContacts?.length || 0})
                </span>
              </div>

              {filteredContacts && filteredContacts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {filteredContacts.map((contact) => (
                    <ContactCard key={contact.contact_id} contact={contact} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Users}
                  title="No contacts yet"
                  description="Add contacts to start messaging"
                  action={<AddContactDialog />}
                />
              )}
            </div>
          </>
        )}
      </ScrollArea>
    </div>
  );
}

export { ContactsView };
