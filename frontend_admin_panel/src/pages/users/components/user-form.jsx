import { useEffect, useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { createUser, updateUser } from '@/services/user';
import { getRoles } from '@/services/roles';

export function UserForm({ user, onClose }) {
  const queryClient = useQueryClient();
  const isEditing = !!user;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);

  const { data: allRoles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
  });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      
      // Select roles
      if (allRoles.length > 0 && user.role) {
        const currentRoleIds = allRoles
          .filter((r) => user.role.includes(r.name))
          .map((r) => r.id);
        setSelectedRoles(currentRoleIds);
      }
    }
  }, [user, allRoles]);

  const mutationFn = isEditing
    ? (data) => updateUser({ id: user.id, ...data })
    : createUser;

  const mutation = useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(isEditing ? 'User updated successfully' : 'User created successfully');
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || `Failed to ${isEditing ? 'update' : 'create'} user`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      name,
      email,
      roleIds: selectedRoles,
    };
    if (password) {
      data.password = password;
    }
    mutation.mutate(data);
  };

  const handleRoleToggle = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit User' : 'Create User'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password {isEditing && <span className="text-xs text-muted-foreground">(leave blank to keep current)</span>}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isEditing}
              minLength={6}
            />
          </div>

          <div className="space-y-2 pt-2">
            <Label>Assign Roles</Label>
            <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto p-1">
              {allRoles.map((role) => (
                <div key={role.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={selectedRoles.includes(role.id)}
                    onCheckedChange={() => handleRoleToggle(role.id)}
                  />
                  <Label
                    htmlFor={`role-${role.id}`}
                    className="font-normal cursor-pointer"
                  >
                    {role.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
