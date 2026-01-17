import { useState } from 'react';
import { Users, UserPlus, X, Loader2, Crown, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/avatar';
import { useGroupMembers, useAddGroupMembers, useRemoveGroupMember } from '../hooks';
import { useContacts } from '@/features/contacts/hooks';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';
import type { GroupMember } from '../types';

interface GroupMembersDialogProps {
  groupId: string;
  groupName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog for viewing and managing group members
 */
function GroupMembersDialog({ groupId, groupName, open, onOpenChange }: GroupMembersDialogProps) {
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const user = useAuthStore((s) => s.user);
  const { data: members, isLoading: loadingMembers } = useGroupMembers(groupId);
  const { data: contacts } = useContacts();
  const addMembers = useAddGroupMembers(groupId);
  const removeMember = useRemoveGroupMember(groupId);

  // Check if current user is admin
  const currentMember = members?.find((m) => m.user_id === user?.user_id);
  const isAdmin = currentMember?.role === 'Admin';

  // Get contacts that are not already members
  const memberIds = members?.map((m) => m.user_id) || [];
  const availableContacts = contacts?.filter((c) => !memberIds.includes(c.contact_id)) || [];

  const handleAddMembers = () => {
    if (selectedContacts.length === 0) return;
    addMembers.mutate(selectedContacts, {
      onSuccess: () => {
        setSelectedContacts([]);
        setShowAddMembers(false);
      },
    });
  };

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Users className="w-5 h-5" />
            {showAddMembers ? 'Add Members' : `${groupName} - Members`}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {showAddMembers ? (
            // Add members view
            <div className="space-y-3 py-2">
              {availableContacts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[hsl(var(--foreground-muted))]">
                    All your contacts are already members
                  </p>
                </div>
              ) : (
                availableContacts.map((contact) => {
                  const isSelected = selectedContacts.includes(contact.contact_id);
                  return (
                    <button
                      key={contact.contact_id}
                      onClick={() => toggleContactSelection(contact.contact_id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-xl transition-colors',
                        isSelected
                          ? 'bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary))]'
                          : 'bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary)/0.8)]'
                      )}
                    >
                      <UserAvatar name={contact.username} size="md" />
                      <div className="flex-1 text-left">
                        <p className="font-medium">{contact.username}</p>
                        <p className="text-xs text-[hsl(var(--foreground-muted))]">
                          {contact.email}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            // Members list view
            <div className="space-y-2 py-2">
              {loadingMembers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--foreground-muted))]" />
                </div>
              ) : members && members.length > 0 ? (
                members.map((member) => (
                  <MemberItem
                    key={member.user_id}
                    member={member}
                    isCurrentUser={member.user_id === user?.user_id}
                    canRemove={isAdmin && member.user_id !== user?.user_id}
                    onRemove={() => removeMember.mutate(member.user_id)}
                    isRemoving={removeMember.isPending}
                  />
                ))
              ) : (
                <p className="text-center py-8 text-[hsl(var(--foreground-muted))]">
                  No members found
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-[hsl(var(--border))] flex gap-2">
          {showAddMembers ? (
            <>
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => {
                  setShowAddMembers(false);
                  setSelectedContacts([]);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl bg-gradient-primary hover:opacity-90"
                onClick={handleAddMembers}
                disabled={selectedContacts.length === 0 || addMembers.isPending}
              >
                {addMembers.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Add {selectedContacts.length > 0 ? `(${selectedContacts.length})` : ''}
              </Button>
            </>
          ) : (
            isAdmin && (
              <Button
                className="w-full rounded-xl bg-gradient-primary hover:opacity-90 gap-2"
                onClick={() => setShowAddMembers(true)}
              >
                <UserPlus className="w-4 h-4" />
                Add Members
              </Button>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface MemberItemProps {
  member: GroupMember;
  isCurrentUser: boolean;
  canRemove: boolean;
  onRemove: () => void;
  isRemoving: boolean;
}

function MemberItem({ member, isCurrentUser, canRemove, onRemove, isRemoving }: MemberItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--secondary))]">
      <UserAvatar name={member.username} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{member.username}</p>
          {isCurrentUser && (
            <span className="text-xs text-[hsl(var(--foreground-muted))]">(You)</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-[hsl(var(--foreground-muted))] truncate">
            {member.email}
          </p>
          {member.role === 'Admin' && (
            <span className="flex items-center gap-1 text-xs text-[hsl(var(--accent-gold))]">
              <Crown className="w-3 h-3" />
              Admin
            </span>
          )}
        </div>
      </div>
      {canRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-lg hover:bg-[hsl(var(--destructive)/0.1)] hover:text-[hsl(var(--destructive))]"
          onClick={onRemove}
          disabled={isRemoving}
        >
          {isRemoving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <X className="w-4 h-4" />
          )}
        </Button>
      )}
    </div>
  );
}

export { GroupMembersDialog };
