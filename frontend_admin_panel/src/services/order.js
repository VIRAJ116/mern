import api from './axios';

export const getAllOrders = async (params) => {
  const response = await api.get('/api/orders', { params });
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/api/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.patch(`/api/orders/${id}/status`, { status });
  return response.data;
};
