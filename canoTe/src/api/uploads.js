import { api, API_BASE } from './client.js';

export const listUploads = (pageId) => api.get(`/pages/${pageId}/uploads`);
export const deleteUpload = (id)    => api.delete(`/uploads/${id}`);

export async function uploadPhoto(pageId, blob) {
  const form = new FormData();
  form.append('file', blob, 'capture.jpg');

  let res;
  try {
    res = await fetch(`${API_BASE}/api/pages/${pageId}/uploads`, {
      method: 'POST',
      credentials: 'include',
      body: form,
    });
  } catch {
    throw new Error('Network error during upload');
  }

  if (res.status === 401) {
    window.dispatchEvent(new Event('auth:expired'));
    throw new Error('Not authenticated');
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(data.detail || 'Upload failed');
  }
  return res.json();
}

/** List all uploads for the authenticated user (across all pages). */
export const listGallery = () => api.get('/uploads');
