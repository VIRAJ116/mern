import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { createRole, updateRole, getPermissions } from '@/services/roles';

export function RoleForm({ role, onClose }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description || '');
      setSelectedPermissions(role.permissions || []);
    }
  }, [role]);

  const { data: allPermissions = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: getPermissions,
  });

  const mutation = useMutation({
    mutationFn: (data) => (role ? updateRole(role.id, data) : createRole(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success(role ? 'Role updated successfully' : 'Role created successfully');
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'An error occurred');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ name, description, permissions: selectedPermissions });
  };

  const handlePermissionToggle = (perm) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const groupedPermissions = allPermissions.reduce((acc, perm) => {
    const group = perm.split(':')[0];
    if (!acc[group]) acc[group] = [];
    acc[group].push(perm);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-bold">
            {role ? 'Edit Role' : 'Create New Role'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form id="role-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Content Manager"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Manages pizzas and categories"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-lg">Permissions</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(groupedPermissions).map(([group, perms]) => (
                  <div key={group} className="space-y-2">
                    <h3 className="font-semibold capitalize text-primary border-b pb-1">
                      {group}
                    </h3>
                    <div className="space-y-2 pt-2">
                      {perms.map((perm) => (
                        <div key={perm} className="flex items-center space-x-2">
                          <Checkbox
                            id={`perm-${perm}`}
                            checked={selectedPermissions.includes(perm)}
                            onCheckedChange={() => handlePermissionToggle(perm)}
                          />
                          <label
                            htmlFor={`perm-${perm}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {perm}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="role-form" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save Role'}
          </Button>
        </div>
      </div>
    </div>
  );
}
