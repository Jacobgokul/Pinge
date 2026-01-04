import { useState } from 'react';
import { Search, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/common';
import { EmptyState } from '@/components/common';
import { ContactItem } from './contact-item';
import { ContactRequestItem } from './contact-request-item';
import { AddContactDialog } from './add-contact-dialog';
import { useContacts, useContactRequests } from '../hooks';

/**
 * Main contacts view with list and requests
 */
function ContactsView() {
  const [search, setSearch] = useState('');

  const { data: contacts, isLoading: contactsLoading } = useContacts();
  const { data: requests, isLoading: requestsLoading } = useContactRequests();

  // Filter contacts by search
  const filteredContacts = contacts?.filter((c) =>
    c.username.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const isLoading = contactsLoading || requestsLoading;
  const hasRequests = requests && requests.length > 0;

  return (
    <div className="flex h-full flex-col bg-[hsl(var(--background))]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
        <h1 className="text-xl font-bold">Contacts</h1>
        <AddContactDialog />
      </header>

      {/* Search */}
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--foreground-muted))]" />
          <Input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="p-4">
            {/* Pending requests */}
            {hasRequests && (
              <>
                <h2 className="mb-2 text-sm font-semibold text-[hsl(var(--foreground-muted))]">
                  Pending Requests ({requests.length})
                </h2>
                <div className="space-y-1">
                  {requests.map((request) => (
                    <ContactRequestItem key={request.request_id} request={request} />
                  ))}
                </div>
                <Separator className="my-4" />
              </>
            )}

            {/* Contacts list */}
            <h2 className="mb-2 text-sm font-semibold text-[hsl(var(--foreground-muted))]">
              All Contacts ({filteredContacts?.length || 0})
            </h2>

            {filteredContacts && filteredContacts.length > 0 ? (
              <div className="space-y-1">
                {filteredContacts.map((contact) => (
                  <ContactItem key={contact.contact_id} contact={contact} />
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
        )}
      </ScrollArea>
    </div>
  );
}

export { ContactsView };
