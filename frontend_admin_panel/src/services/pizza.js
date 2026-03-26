import api from './axios';

export const getAllPizzas = async (params) => {
  const response = await api.get('/api/pizzas', { params });
  return response.data;
};

export const getPizzaById = async (id) => {
  const response = await api.get(`/api/pizzas/${id}`);
  return response.data;
};

export const createPizza = async (data) => {
  const response = await api.post('/api/pizzas', data);
  return response.data;
};

export const updatePizza = async (id, data) => {
  const response = await api.patch(`/api/pizzas/${id}`, data);
  return response.data;
};

export const deletePizza = async (id) => {
  const response = await api.delete(`/api/pizzas/${id}`);
  return response.data;
};
