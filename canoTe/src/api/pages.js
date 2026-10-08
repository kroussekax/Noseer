import { api } from './client.js';

export const listPages   = (chapterId)       => api.get(`/chapters/${chapterId}/pages`);
export const createPage  = (chapterId, data) => api.post(`/chapters/${chapterId}/pages`, data);
export const getPage     = (id)              => api.get(`/pages/${id}`);
export const updatePage  = (id, data)        => api.patch(`/pages/${id}`, data);
export const deletePage  = (id)              => api.delete(`/pages/${id}`);
