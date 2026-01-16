import { useState } from 'react';
import { Search, UsersRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner } from '@/components/common';
import { EmptyState } from '@/components/common';
import { GroupCard } from './group-card';
import { CreateGroupDialog } from './create-group-dialog';
import { useGroups } from '../hooks';

/**
 * Main groups view with card grid layout
 */
function GroupsView() {
  const [search, setSearch] = useState('');
  const { data: groups, isLoading } = useGroups();

  // Filter groups by search
  const filteredGroups = groups?.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  return (
    <div className="flex h-full flex-col bg-[hsl(var(--background))]">
      {/* Header */}
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Groups</h1>
          <CreateGroupDialog />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--foreground-muted))]" />
          <Input
            type="text"
            placeholder="Search groups..."
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
          <div className="pb-6">
            {/* Section header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[hsl(var(--accent-purple)/0.1)] flex items-center justify-center">
                <UsersRound className="w-4 h-4 text-[hsl(var(--accent-purple))]" />
              </div>
              <h2 className="font-semibold">Your Groups</h2>
              <span className="text-sm text-[hsl(var(--foreground-muted))]">
                ({filteredGroups?.length || 0})
              </span>
            </div>

            {filteredGroups && filteredGroups.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filteredGroups.map((group) => (
                  <GroupCard key={group.group_id} group={group} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={UsersRound}
                title="No groups yet"
                description="Create a group to chat with multiple people"
                action={<CreateGroupDialog />}
              />
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

export { GroupsView };
