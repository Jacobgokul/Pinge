import { createFileRoute } from '@tanstack/react-router';
import { ContactsView } from '@/features/contacts/components/contacts-view';

export const Route = createFileRoute('/_app/contacts')({
  component: ContactsPage,
});

function ContactsPage() {
  return <ContactsView />;
}
