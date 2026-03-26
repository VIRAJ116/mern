import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Users, Eye, Mail, Phone, Calendar, Loader2 } from 'lucide-react';

import { cn, formatDate } from '@/lib/utils';
import { getAllUsers } from '@/services/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [viewUser, setViewUser] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
  });

  const users = data?.data || data || [];

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [users, search]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-9 w-full max-w-sm" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">
          Registered customers and their details ({filtered.length})
        </p>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table or Empty State */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No users found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search ? 'Try a different search term' : 'No registered users yet'}
          </p>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {user.name
                          ? user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)
                          : '?'}
                      </div>
                      <span className="font-medium">{user.name || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email || 'N/A'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.phone || 'N/A'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewUser(user)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* User Detail Dialog */}
      <Dialog
        open={Boolean(viewUser)}
        onOpenChange={(open) => {
          if (!open) setViewUser(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Information about the selected user.
            </DialogDescription>
          </DialogHeader>
          {viewUser && (
            <div className="space-y-5">
              {/* Avatar & Name */}
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {viewUser.name
                    ? viewUser.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : '?'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{viewUser.name || 'N/A'}</h3>
                  {viewUser.role && (
                    <Badge variant="secondary" className="mt-0.5 text-xs">
                      {viewUser.role}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="ml-auto font-medium">{viewUser.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="ml-auto font-medium">{viewUser.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Registered:</span>
                  <span className="ml-auto font-medium">
                    {viewUser.createdAt ? formatDate(viewUser.createdAt) : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Address if present */}
              {viewUser.address && (
                <div className="space-y-1.5">
                  <h4 className="text-sm font-medium text-muted-foreground">Address</h4>
                  <p className="rounded-lg border p-3 text-sm">
                    {typeof viewUser.address === 'string'
                      ? viewUser.address
                      : [
                          viewUser.address.street,
                          viewUser.address.city,
                          viewUser.address.state,
                          viewUser.address.pincode,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
