import api from './axios';

export const login = async (data) => {
  const response = await api.post('/login', data);
  return response.data;
};

export const validateMe = async () => {
  const response = await api.get('/validate-me');
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/logout');
  return response.data;
};
