import { useState } from 'react';
import { Search, UsersRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner } from '@/components/common';
import { EmptyState } from '@/components/common';
import { GroupItem } from './group-item';
import { CreateGroupDialog } from './create-group-dialog';
import { useGroups } from '../hooks';

/**
 * Main groups view with list
 */
function GroupsView() {
  const [search, setSearch] = useState('');
  const { data: groups, isLoading } = useGroups();

  // Filter groups by search
  const filteredGroups = groups?.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col bg-[hsl(var(--background))]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
        <h1 className="text-xl font-bold">Groups</h1>
        <CreateGroupDialog />
      </header>

      {/* Search */}
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--foreground-muted))]" />
          <Input
            type="text"
            placeholder="Search groups..."
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
        ) : filteredGroups && filteredGroups.length > 0 ? (
          <div className="space-y-1 p-4">
            {filteredGroups.map((group) => (
              <GroupItem key={group.group_id} group={group} />
            ))}
          </div>
        ) : (
          <div className="p-4">
            <EmptyState
              icon={UsersRound}
              title="No groups yet"
              description="Create a group to chat with multiple people"
              action={<CreateGroupDialog />}
            />
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

export { GroupsView };
