import { api, buildQuery } from './api.js';

export const assignmentService = {
  list: (params) => api.get(`/assignments${buildQuery(params)}`),
  create: (payload) => api.post('/assignments', payload),
  returnAsset: (id, payload) => api.put(`/assignments/${id}/return`, payload)
};
