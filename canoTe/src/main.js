import './styles/style.css';
import { state, subscribe, notify } from './state.js';
import { initRouter } from './utils/router.js';
import { renderApp } from './app.js';
import { loadPreferences } from './utils/preferences.js';
import { getMe } from './api/auth.js';
import { listNotebooks } from './api/notebooks.js';
import { loadStoredPhotos } from './utils/camera.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('app');

  // 1. Load preferences from localStorage and apply them to DOM
  loadPreferences();

  // 2. Initialize router navigation
  initRouter();

  // 3. Subscribe render loop to state changes
  subscribe(() => {
    renderApp(container);
  });

  // 4. Check user authentication session
  state.authLoading = true;
  renderApp(container);

  try {
    const user = await getMe();
    state.user = user;
    state.notebooksLoading = true;
    notify();

    // Fetch initial notebooks
    state.notebooks = await listNotebooks().catch(() => []);
    // Fetch gallery photos
    loadStoredPhotos();
  } catch (err) {
    state.user = null;
    state.notebooks = [];
  } finally {
    state.authLoading = false;
    state.notebooksLoading = false;
    notify();
  }

  // 5. Global session expiry handler
  window.addEventListener('auth:expired', () => {
    state.user = null;
    state.notebooks = [];
    state.currentNotebook = null;
    state.currentChapter = null;
    state.currentPage = null;
    notify();
  });
});
