import api from '@/services/axios';

export const getRoles = async () => {
  const { data } = await api.get('/admin/roles');
  return data.data;
};

export const getPermissions = async () => {
  const { data } = await api.get('/admin/permissions');
  return data.data;
};

export const createRole = async (roleData) => {
  const { data } = await api.post('/admin/roles', roleData);
  return data.data;
};

export const updateRole = async (id, roleData) => {
  const { data } = await api.put(`/admin/roles/${id}`, roleData);
  return data.data;
};

export const deleteRole = async (id) => {
  const { data } = await api.delete(`/admin/roles/${id}`);
  return data.data;
};
