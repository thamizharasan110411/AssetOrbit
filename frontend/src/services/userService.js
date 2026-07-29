import { api, buildQuery } from './api.js';

export const userService = {
  list: (params) => api.get(`/users${buildQuery(params)}`),
  update: (id, payload) => api.put(`/users/${id}`, payload)
};
