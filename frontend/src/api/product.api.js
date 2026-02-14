import api from './axios';
import { API_ENDPOINTS } from '../constants/api-endpoints';

export const productAPI = {
  getAll: () => api.get(API_ENDPOINTS.PRODUCTS.BASE),

  getById: (id) =>
    api.get(API_ENDPOINTS.PRODUCTS.SINGLE(id)),

  create: (data) =>
    api.post(API_ENDPOINTS.PRODUCTS.BASE, data),

  update: (id, data) =>
    api.patch(`${API_ENDPOINTS.PRODUCTS.SINGLE(id)}`, data),

  delete: (id) =>
    api.delete(API_ENDPOINTS.PRODUCTS.SINGLE(id)),

  updateStock: (id, quantity) =>
    api.patch(API_ENDPOINTS.PRODUCTS.UPDATE_STOCK(id), { quantity }),
};
