import api from './axios';

export const getAllPizzas = async (params) => {
  const response = await api.get('/pizzas', { params });
  return response.data;
};

export const getPizzaById = async (id) => {
  const response = await api.get(`/admin/pizzas/${id}`);
  return response.data;
};

export const createPizza = async (data) => {
  const response = await api.post('/admin/pizzas', data);
  return response.data;
};

export const updatePizza = async (id, data) => {
  const response = await api.patch(`/admin/pizzas/${id}`, data);
  return response.data;
};

export const deletePizza = async (id) => {
  const response = await api.delete(`/admin/pizzas/${id}`);
  return response.data;
};
