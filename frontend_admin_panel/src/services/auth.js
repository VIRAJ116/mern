import api from './axios';
import { setAccessToken, clearAccessToken } from './token-store';

export const login = async (data) => {
  const response = await api.post('/login', data);
  if (response.data?.accessToken) setAccessToken(response.data.accessToken);
  // returns user payload
  return response.data.data;
};

export const refresh = async () => {
  const response = await api.post('/refresh');
  if (response.data?.accessToken) setAccessToken(response.data.accessToken);
  return response.data.data;
};

export const logout = async () => {
  try {
    const response = await api.post('/logout');
    return response.data;
  } finally {
    clearAccessToken();
  }
};
