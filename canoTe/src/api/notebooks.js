import { api } from './client.js';

export const listNotebooks   = ()           => api.get('/notebooks');
export const createNotebook  = (data)       => api.post('/notebooks', data);
export const getNotebook     = (id)         => api.get(`/notebooks/${id}`);
export const updateNotebook  = (id, data)   => api.patch(`/notebooks/${id}`, data);
export const deleteNotebook  = (id)         => api.delete(`/notebooks/${id}`);
