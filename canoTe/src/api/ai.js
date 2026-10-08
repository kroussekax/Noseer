import { api, API_BASE } from './client.js';

/**
 * Upload an image for AI analysis.
 * Returns { upload_id, analysis } or throws on error.
 */
export async function analyzeImage(blob) {
  const form = new FormData();
  form.append('file', blob, 'capture.jpg');

  let res;
  try {
    res = await fetch(`${API_BASE}/api/ai/analyze`, {
      method: 'POST',
      credentials: 'include',
      body: form,
    });
  } catch {
    throw new Error('Network error during AI analysis');
  }

  if (res.status === 401) {
    window.dispatchEvent(new Event('auth:expired'));
    throw new Error('Not authenticated');
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(data.detail || 'AI analysis failed');
  }
  return res.json();
}

/**
 * Confirm AI analysis and create the actual page.
 * Returns the created page object.
 */
export const confirmAnalysis = (data) => api.post('/ai/confirm', data);
