import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Loader2, UsersRound, FileText } from 'lucide-react';
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
import { useCreateGroup } from '../hooks';

const createGroupSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters'),
  description: z.string().max(200, 'Description must be at most 200 characters').optional(),
});

type CreateGroupForm = z.infer<typeof createGroupSchema>;

/**
 * Dialog for creating a new group
 */
function CreateGroupDialog() {
  const [open, setOpen] = useState(false);
  const createGroup = useCreateGroup();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateGroupForm>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = (data: CreateGroupForm) => {
    createGroup.mutate(data, {
      onSuccess: () => {
        reset();
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl bg-gradient-primary hover:opacity-90 gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create Group</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Create Group</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-[hsl(var(--foreground-secondary))]">
              Group Name
            </Label>
            <div className="relative">
              <UsersRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--foreground-muted))]" />
              <Input
                id="name"
                placeholder="Enter group name"
                className="h-12 pl-11 rounded-xl bg-[hsl(var(--secondary))] border-[hsl(var(--border))] focus:border-[hsl(var(--primary))]"
                {...register('name')}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-[hsl(var(--destructive))]">{errors.name.message}</p>
            )}
          </div>

          {/* Description field */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-[hsl(var(--foreground-secondary))]">
              Description (optional)
            </Label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--foreground-muted))]" />
              <Input
                id="description"
                placeholder="What's this group about?"
                className="h-12 pl-11 rounded-xl bg-[hsl(var(--secondary))] border-[hsl(var(--border))] focus:border-[hsl(var(--primary))]"
                {...register('description')}
              />
            </div>
            {errors.description && (
              <p className="text-sm text-[hsl(var(--destructive))]">{errors.description.message}</p>
            )}
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
              type="submit"
              disabled={createGroup.isPending}
              className="rounded-xl bg-gradient-primary hover:opacity-90"
            >
              {createGroup.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Group
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { CreateGroupDialog };
