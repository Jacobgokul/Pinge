import { useState } from 'react';
import { UserPlus, Loader2, Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSendContactRequest } from '../hooks';

/**
 * Dialog for adding new contacts by email
 */
function AddContactDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');

  const sendRequest = useSendContactRequest();

  const handleSendRequest = () => {
    if (!email.trim()) return;

    sendRequest.mutate(email, {
      onSuccess: () => {
        setEmail('');
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl bg-gradient-primary hover:opacity-90 gap-2">
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Contact</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Add Contact</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-[hsl(var(--foreground-secondary))]">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--foreground-muted))]" />
              <Input
                id="email"
                type="email"
                placeholder="Enter email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 pl-11 rounded-xl bg-[hsl(var(--secondary))] border-[hsl(var(--border))] focus:border-[hsl(var(--primary))]"
              />
            </div>
            <p className="text-xs text-[hsl(var(--foreground-muted))]">
              Enter the email of the person you want to add as a contact
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendRequest}
            disabled={sendRequest.isPending || !email.trim()}
            className="rounded-xl bg-gradient-primary hover:opacity-90"
          >
            {sendRequest.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { AddContactDialog };
