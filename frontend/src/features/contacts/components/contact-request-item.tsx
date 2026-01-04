import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/avatar';
import { useAcceptRequest, useRejectRequest } from '../hooks';
import type { ContactRequest } from '../types';

interface ContactRequestItemProps {
  request: ContactRequest;
}

/**
 * Contact request item with accept/reject actions
 */
function ContactRequestItem({ request }: ContactRequestItemProps) {
  const acceptRequest = useAcceptRequest();
  const rejectRequest = useRejectRequest();

  const isLoading = acceptRequest.isPending || rejectRequest.isPending;

  return (
    <div className="flex items-center justify-between rounded-lg p-3 hover:bg-[hsl(var(--secondary))]">
      {/* User info */}
      <div className="flex items-center gap-3">
        <UserAvatar name={request.sender_username} size="md" />
        <div>
          <h3 className="font-medium">{request.sender_username}</h3>
          <p className="text-sm text-[hsl(var(--foreground-muted))]">{request.sender_email}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => rejectRequest.mutate(request.request_id)}
          disabled={isLoading}
        >
          <X className="h-5 w-5 text-[hsl(var(--destructive))]" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => acceptRequest.mutate(request.request_id)}
          disabled={isLoading}
        >
          <Check className="h-5 w-5 text-[hsl(var(--success))]" />
        </Button>
      </div>
    </div>
  );
}

export { ContactRequestItem };
