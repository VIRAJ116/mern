import api from './axios';

export const login = async (data) => {
  const response = await api.post('/login', data);
  // response.data = { success, data: { id, email, name, role } }
  return response.data.data;
};

export const validateMe = async () => {
  const response = await api.get('/validate-me');
  // response.data = { success, user: { userId, role, permissions } }
  return response.data.user;
};

export const logout = async () => {
  const response = await api.post('/logout');
  return response.data;
};
