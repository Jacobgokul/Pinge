import { createFileRoute } from '@tanstack/react-router';
import { GroupsView } from '@/features/groups/components/groups-view';

export const Route = createFileRoute('/_app/groups')({
  component: GroupsPage,
});

function GroupsPage() {
  return <GroupsView />;
}
