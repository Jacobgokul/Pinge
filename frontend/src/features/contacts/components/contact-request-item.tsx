import { Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/avatar';
import { useAcceptRequest, useRejectRequest } from '../hooks';
import type { ContactRequest } from '../types';

interface ContactRequestItemProps {
  request: ContactRequest;
}

/**
 * Contact request item with modern card design
 */
function ContactRequestItem({ request }: ContactRequestItemProps) {
  const acceptRequest = useAcceptRequest();
  const rejectRequest = useRejectRequest();

  const isLoading = acceptRequest.isPending || rejectRequest.isPending;

  return (
    <div className="flex items-center justify-between rounded-xl p-4 bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
      {/* User info */}
      <div className="flex items-center gap-3">
        <UserAvatar name={request.sender_username} size="md" />
        <div>
          <h3 className="font-semibold">{request.sender_username}</h3>
          <p className="text-sm text-[hsl(var(--foreground-muted))]">{request.sender_email}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="w-10 h-10 rounded-xl border-[hsl(var(--destructive)/0.3)] hover:bg-[hsl(var(--destructive)/0.1)] hover:border-[hsl(var(--destructive))]"
          onClick={() => rejectRequest.mutate(request.request_id)}
          disabled={isLoading}
        >
          {rejectRequest.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-5 w-5 text-[hsl(var(--destructive))]" />
          )}
        </Button>
        <Button
          size="icon"
          className="w-10 h-10 rounded-xl bg-gradient-primary hover:opacity-90"
          onClick={() => acceptRequest.mutate(request.request_id)}
          disabled={isLoading}
        >
          {acceptRequest.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            <Check className="h-5 w-5 text-white" />
          )}
        </Button>
      </div>
    </div>
  );
}

export { ContactRequestItem };
