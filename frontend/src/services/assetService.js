import { api, buildQuery } from './api.js';

export const assetService = {
  list: (params) => api.get(`/assets${buildQuery(params)}`),
  get: (id) => api.get(`/assets/${id}`),
  create: (payload) => api.post('/assets', payload),
  update: (id, payload) => api.put(`/assets/${id}`, payload),
  remove: (id) => api.delete(`/assets/${id}`)
};
