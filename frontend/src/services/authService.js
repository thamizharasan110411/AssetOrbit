import { api } from './api.js';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (payload) => api.post('/auth/register', payload),
  logout: () => api.post('/auth/logout'),
  profile: () => api.get('/profile'),
  updateProfile: (payload) => api.put('/profile', payload),
  changePassword: (payload) => api.put('/profile/password', payload)
};
