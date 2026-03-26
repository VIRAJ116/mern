import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Search, Pizza, Pencil, Trash2, LayoutGrid, List, Star, Loader2 } from 'lucide-react';

import { cn, formatCurrency } from '@/lib/utils';
import { getAllPizzas, deletePizza } from '@/services/pizza';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/data-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const categoryColors = {
  veg: 'bg-green-100 text-green-800 border-green-200',
  'non-veg': 'bg-red-100 text-red-800 border-red-200',
  special: 'bg-amber-100 text-amber-800 border-amber-200',
};

const tagColors = {
  bestseller: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  popular: 'bg-blue-50 text-blue-700 border-blue-200',
  spicy: 'bg-orange-50 text-orange-700 border-orange-200',
  'chef-special': 'bg-purple-50 text-purple-700 border-purple-200',
  fusion: 'bg-teal-50 text-teal-700 border-teal-200',
  premium: 'bg-pink-50 text-pink-700 border-pink-200',
};

const columns = [
  {
    accessorKey: 'imageUrl',
    header: '',
    meta: { headerClassName: 'w-12', cellClassName: '' },
    cell: ({ row }) => {
      const pizza = row.original;
      return pizza.imageUrl ? (
        <img src={pizza.imageUrl} alt={pizza.name} className="h-10 w-10 rounded-lg object-cover" />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Pizza className="h-5 w-5 text-primary/50" />
        </div>
      );
    },
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ getValue }) => {
      const category = getValue();
      return category ? (
        <Badge variant="outline" className={cn('text-[10px]', categoryColors[category])}>
          {category}
        </Badge>
      ) : null;
    },
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => (
      <span className="font-semibold">
        {formatCurrency(row.original.basePrice || row.original.price || 0)}
      </span>
    ),
  },
  {
    accessorKey: 'tags',
    header: 'Tags',
    cell: ({ getValue }) => {
      const tags = getValue();
      return tags?.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className={cn('text-[10px] px-1.5 py-0', tagColors[tag])}
            >
              {tag}
            </Badge>
          ))}
        </div>
      ) : null;
    },
  },
  {
    accessorKey: 'rating',
    header: 'Rating',
    cell: ({ getValue }) => {
      const rating = getValue();
      return rating != null ? (
        <div className="flex items-center gap-1 text-sm">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          {rating}
        </div>
      ) : null;
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
    cell: () => null, // Placeholder — overridden in component via getActionsColumn
  },
];

export default function PizzasPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, pizza: null });

  const { data, isLoading } = useQuery({
    queryKey: ['pizzas'],
    queryFn: getAllPizzas,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deletePizza(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pizzas'] });
      toast.success('Pizza deleted successfully');
      setDeleteDialog({ open: false, pizza: null });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete pizza');
    },
  });

  const pizzas = useMemo(() => data?.data || data || [], [data]);

  const filtered = useMemo(() => {
    if (!search.trim()) return pizzas;
    const q = search.toLowerCase();
    return pizzas.filter((p) => p.name?.toLowerCase().includes(q));
  }, [pizzas, search]);

  const handleDelete = () => {
    if (deleteDialog.pizza) {
      deleteMutation.mutate(deleteDialog.pizza.id || deleteDialog.pizza._id);
    }
  };

  // Build columns with actions that have access to component state
  const tableColumns = useMemo(() => {
    return columns.map((col) => {
      if (col.id === 'actions') {
        return {
          ...col,
          cell: ({ row }) => {
            const pizza = row.original;
            return (
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon" asChild>
                  <Link to={`/pizzas/${pizza.id || pizza._id}/edit`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteDialog({ open: true, pizza })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          },
        };
      }
      return col;
    });
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
        <Skeleton className="h-9 w-full max-w-sm" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pizzas</h1>
          <p className="text-sm text-muted-foreground">
            Manage your pizza menu ({filtered.length} items)
          </p>
        </div>
        <Button asChild>
          <Link to="/pizzas/new">
            <Plus className="h-4 w-4" />
            Add Pizza
          </Link>
        </Button>
      </div>

      {/* Search and View Toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search pizzas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Pizza className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No pizzas found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search ? 'Try a different search term' : 'Get started by adding your first pizza'}
          </p>
          {!search && (
            <Button asChild className="mt-4">
              <Link to="/pizzas/new">
                <Plus className="h-4 w-4" />
                Add Pizza
              </Link>
            </Button>
          )}
        </div>
      )}

      {/* Grid View */}
      {filtered.length > 0 && viewMode === 'grid' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pizza) => (
            <Card
              key={pizza.id || pizza._id}
              className="group overflow-hidden transition-shadow hover:shadow-lg"
            >
              {pizza.imageUrl ? (
                <div className="relative h-44 overflow-hidden bg-muted">
                  <img
                    src={pizza.imageUrl}
                    alt={pizza.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="flex h-44 items-center justify-center bg-linear-to-br from-primary/10 to-primary/5">
                  <Pizza className="h-16 w-16 text-primary/40" />
                </div>
              )}

              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold">{pizza.name}</h3>
                    <p className="mt-0.5 text-lg font-bold text-primary">
                      {formatCurrency(pizza.basePrice || pizza.price || 0)}
                    </p>
                  </div>
                  {pizza.category && (
                    <Badge
                      variant="outline"
                      className={cn(
                        'shrink-0 text-[10px]',
                        categoryColors[pizza.category] || 'bg-gray-100 text-gray-700'
                      )}
                    >
                      {pizza.category}
                    </Badge>
                  )}
                </div>

                {pizza.rating != null && (
                  <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{pizza.rating}</span>
                  </div>
                )}

                {pizza.tags && pizza.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {pizza.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className={cn('text-[10px] px-1.5 py-0', tagColors[tag])}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link to={`/pizzas/${pizza.id || pizza._id}/edit`}>
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => setDeleteDialog({ open: true, pizza })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Table View */}
      {filtered.length > 0 && viewMode === 'table' && (
        <Card>
          <DataTable columns={tableColumns} data={filtered} />
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => {
          if (!open) setDeleteDialog({ open: false, pizza: null });
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Pizza</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-foreground">{deleteDialog.pizza?.name}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, pizza: null })}
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
