import api from './axios';

// Public endpoint — no auth needed
export const getToppings = async () => {
  const response = await api.get('/toppings');
  return response.data;
};

// Admin endpoints — cookie auth is sent automatically
export const createTopping = async (data) => {
  const response = await api.post('/admin/toppings', data);
  return response.data;
};

export const updateTopping = async (id, data) => {
  const response = await api.patch(`/admin/toppings/${id}`, data);
  return response.data;
};

export const deleteTopping = async (id) => {
  const response = await api.delete(`/admin/toppings/${id}`);
  return response.data;
};
