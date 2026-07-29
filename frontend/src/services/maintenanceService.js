import { api, buildQuery } from './api.js';

export const maintenanceService = {
  list: (params) => api.get(`/maintenance${buildQuery(params)}`),
  create: (payload) => api.post('/maintenance', payload),
  update: (id, payload) => api.put(`/maintenance/${id}`, payload)
};
