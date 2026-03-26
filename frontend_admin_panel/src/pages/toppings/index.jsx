import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Cherry } from 'lucide-react';

import { cn, formatCurrency } from '@/lib/utils';
import {
  getToppings,
  createTopping,
  updateTopping,
  deleteTopping,
} from '@/services/topping';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const toppingSchema = z.object({
  name: z.string().nonempty('Topping name is required'),
  price: z.coerce.number().min(0, 'Price must be 0 or more'),
  icon: z.string().optional().default(''),
});

export default function ToppingsPage() {
  const queryClient = useQueryClient();
  const [formDialog, setFormDialog] = useState({ open: false, topping: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, topping: null });

  const { data, isLoading } = useQuery({
    queryKey: ['toppings'],
    queryFn: getToppings,
  });

  const toppings = data?.data || data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(toppingSchema),
    defaultValues: { name: '', price: '', icon: '' },
  });

  const openCreateDialog = () => {
    reset({ name: '', price: '', icon: '' });
    setFormDialog({ open: true, topping: null });
  };

  const openEditDialog = (topping) => {
    reset({
      name: topping.name || '',
      price: topping.price ?? '',
      icon: topping.icon || '',
    });
    setFormDialog({ open: true, topping });
  };

  const createMutation = useMutation({
    mutationFn: (data) => createTopping(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toppings'] });
      toast.success('Topping created successfully');
      setFormDialog({ open: false, topping: null });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create topping');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTopping(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toppings'] });
      toast.success('Topping updated successfully');
      setFormDialog({ open: false, topping: null });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update topping');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTopping(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toppings'] });
      toast.success('Topping deleted successfully');
      setDeleteDialog({ open: false, topping: null });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete topping');
    },
  });

  const isFormSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data) => {
    if (formDialog.topping) {
      updateMutation.mutate({ id: formDialog.topping._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = () => {
    if (deleteDialog.topping) {
      deleteMutation.mutate(deleteDialog.topping._id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-36" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Toppings</h1>
          <p className="text-sm text-muted-foreground">
            Manage available toppings ({toppings.length})
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          Add Topping
        </Button>
      </div>

      {/* Table or Empty State */}
      {toppings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Cherry className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No toppings yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add toppings that customers can add to their pizzas
          </p>
          <Button className="mt-4" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Add Topping
          </Button>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {toppings.map((topping) => (
                <TableRow key={topping._id}>
                  <TableCell>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/5 text-lg">
                      {topping.icon || '🍕'}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{topping.name}</TableCell>
                  <TableCell className="font-semibold text-primary">
                    {formatCurrency(topping.price || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(topping)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteDialog({ open: true, topping })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={formDialog.open}
        onOpenChange={(open) => {
          if (!open) setFormDialog({ open: false, topping: null });
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {formDialog.topping ? 'Edit Topping' : 'Add Topping'}
            </DialogTitle>
            <DialogDescription>
              {formDialog.topping
                ? 'Update the topping details below.'
                : 'Fill in the details for the new topping.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="topping-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="topping-name"
                placeholder="e.g. Mozzarella, Olives"
                disabled={isFormSubmitting}
                className={cn(
                  errors.name && 'border-destructive focus-visible:ring-destructive'
                )}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="topping-price">
                Price (INR) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="topping-price"
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 49"
                disabled={isFormSubmitting}
                className={cn(
                  errors.price && 'border-destructive focus-visible:ring-destructive'
                )}
                {...register('price')}
              />
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price.message}</p>
              )}
            </div>

            {/* Icon */}
            <div className="space-y-2">
              <Label htmlFor="topping-icon">Icon (Emoji)</Label>
              <Input
                id="topping-icon"
                placeholder="e.g. 🧀 🫒 🍄"
                disabled={isFormSubmitting}
                {...register('icon')}
              />
              <p className="text-xs text-muted-foreground">
                Optional. Paste an emoji to represent this topping.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormDialog({ open: false, topping: null })}
                disabled={isFormSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isFormSubmitting}>
                {isFormSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : formDialog.topping ? (
                  'Update'
                ) : (
                  'Create'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => {
          if (!open) setDeleteDialog({ open: false, topping: null });
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Topping</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-foreground">
                {deleteDialog.topping?.name}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, topping: null })}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
