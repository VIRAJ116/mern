import api from './axios';

export const getAllUsers = async (params) => {
  const response = await api.get('/users', { params });
  return response.data;
};

export const createUser = async (data) => {
  const response = await api.post('/users', data);
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const updateUserRoles = async ({ id, roleIds }) => {
  const response = await api.patch(`/users/${id}/roles`, { roleIds });
  return response.data;
};

export const updateUser = async ({ id, ...data }) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};
