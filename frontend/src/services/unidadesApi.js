import api from './api';

export const unidadesApi = {
  getAll: (params) => api.get('/unidades', { params }),
  getById: (id) => api.get(`/unidades/${id}`),
  create: (data) => api.post('/unidades', data),
  update: (id, data) => api.put(`/unidades/${id}`, data),
  delete: (id) => api.delete(`/unidades/${id}`),
};
