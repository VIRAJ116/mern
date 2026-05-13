import api from './axios';

export const getAllOrders = async (params) => {
  const response = await api.get('/admin/orders', { params });
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/admin/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.patch(`/admin/orders/${id}/status`, { status });
  return response.data;
};
