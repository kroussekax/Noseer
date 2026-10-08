import { api } from './client.js';

export const getMe       = ()               => api.get('/auth/me');
export const login       = (email, pass)    => api.post('/auth/login',    { email, password: pass });
export const register    = (email, pass)    => api.post('/auth/register', { email, password: pass });
export const logout      = ()               => api.post('/auth/logout');
