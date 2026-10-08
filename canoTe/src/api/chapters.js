import { api } from './client.js';

export const listChapters   = (notebookId)       => api.get(`/notebooks/${notebookId}/chapters`);
export const createChapter  = (notebookId, data) => api.post(`/notebooks/${notebookId}/chapters`, data);
export const getChapter     = (id)               => api.get(`/chapters/${id}`);
export const updateChapter  = (id, data)         => api.patch(`/chapters/${id}`, data);
export const deleteChapter  = (id)               => api.delete(`/chapters/${id}`);
