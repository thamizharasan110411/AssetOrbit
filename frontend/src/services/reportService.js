import { api } from './api.js';

export const reportService = {
  assets: () => api.get('/reports/assets'),
  maintenance: () => api.get('/reports/maintenance'),
  warranty: () => api.get('/reports/warranty')
};
