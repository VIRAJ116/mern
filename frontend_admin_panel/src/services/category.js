import api from './axios';

// Public endpoint — no auth needed
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

// Admin endpoints — cookie auth sent automatically
export const createCategory = async (data) => {
  const response = await api.post('/admin/categories', data);
  return response.data;
};

export const updateCategory = async (id, data) => {
  const response = await api.patch(`/admin/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/admin/categories/${id}`);
  return response.data;
};
