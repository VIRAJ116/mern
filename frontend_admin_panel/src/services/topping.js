import api from './axios';

export const getToppings = async () => {
  const response = await api.get('/api/toppings');
  return response.data;
};

export const createTopping = async (data) => {
  const response = await api.post('/api/toppings', data);
  return response.data;
};

export const updateTopping = async (id, data) => {
  const response = await api.patch(`/api/toppings/${id}`, data);
  return response.data;
};

export const deleteTopping = async (id) => {
  const response = await api.delete(`/api/toppings/${id}`);
  return response.data;
};
