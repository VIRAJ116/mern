import api from './axios';

export const generatePizzaDescription = async (data) => {
  const response = await api.post('/admin/ai/pizza-description', data);
  return response.data;
};
