import {
  state,
  toggleSearch,
  closeSearch,
  setSearchTerm,
  nextMode,
  nextTone,
  nextRatio,
  toggleHaptics,
  togglePrivacy,
  setRoute,
  goBack,
  deletePhoto,
  clearAllPhotos,
  notify,
} from './state.js';

import { login, register, logout } from './api/auth.js';
import { listNotebooks, createNotebook, getNotebook, deleteNotebook } from './api/notebooks.js';
import { listChapters, createChapter, deleteChapter } from './api/chapters.js';
import { listPages, createPage, getPage, updatePage, deletePage } from './api/pages.js';
import { deleteUpload, uploadPhoto, listGallery } from './api/uploads.js';

import { renderLoginPage } from './pages/login.js';
import { renderNotesPage } from './pages/notes.js';
import { renderNotebookDetailPage } from './pages/notebook.js';
import { renderChapterDetailPage } from './pages/chapter.js';
import { renderCameraPage } from './pages/camera.js';
import { renderGalleryPage } from './pages/gallery.js';
import { renderSettingsPage } from './pages/settings.js';
import { renderNotificationsPage } from './pages/notifications.js';

import {
  attachCameraStream,
  stopCamera,
  captureSnapshot,
  toggleCameraFacing,
  startCamera,
  loadStoredPhotos,
  analyzeLastCapture,
  confirmAIAnalysis,
  discardAIAnalysis,
} from './utils/camera.js';

let previewModalPhoto = null;
let isRegistering = false;
let authErrorMessage = '';
let saveTimeout = null;

export function renderApp(container) {
  // 1. Initial Auth Loading Screen
  if (state.authLoading) {
    container.innerHTML = `
      <div class="min-h-screen flex flex-col items-center justify-center bg-surface text-on-surface">
        <div class="relative w-16 h-16 mb-4 flex items-center justify-center">
          <div class="w-12 h-12 rounded-full border border-dashed border-primary animate-spin"></div>
        </div>
        <span class="font-label-md text-xs tracking-widest uppercase text-outline">INITIALIZING VAULT...</span>
      </div>
    `;
    return;
  }

  // 2. Unauthenticated Gate: Render Login Page
  if (!state.user) {
    stopCamera();
    container.innerHTML = renderLoginPage(state, isRegistering, authErrorMessage);
    attachAuthEventListeners();
    return;
  }

  // 3. Routing
  const route = state.currentRoute;
  let pageHtml = '';

  const notebookMatch = route.match(/^\/notebooks\/([a-zA-Z0-9_-]+)$/);
  const chapterMatch = route.match(/^\/notebooks\/([a-zA-Z0-9_-]+)\/chapters\/([a-zA-Z0-9_-]+)$/);

  if (route === '/camera') {
    pageHtml = renderCameraPage(state);
  } else if (route === '/gallery') {
    pageHtml = renderGalleryPage(state, previewModalPhoto);
  } else if (route === '/settings') {
    pageHtml = renderSettingsPage(state);
  } else if (route === '/notifications') {
    pageHtml = renderNotificationsPage(state);
  } else if (chapterMatch) {
    pageHtml = renderChapterDetailPage(state);
  } else if (notebookMatch) {
    pageHtml = renderNotebookDetailPage(state);
  } else {
    pageHtml = renderNotesPage(state);
  }

  // Preserve search input focus & cursor if active
  const searchInput = document.getElementById('search-input');
  const isInputFocused = document.activeElement === searchInput;
  const selectionStart = searchInput ? searchInput.selectionStart : null;

  // Preserve editor textarea / title cursor if active
  const activeEditorId = document.activeElement ? document.activeElement.id : null;
  const editorSelStart = document.activeElement ? document.activeElement.selectionStart : null;
  const editorSelEnd = document.activeElement ? document.activeElement.selectionEnd : null;

  container.innerHTML = pageHtml;

  // Restore input focus
  if (isInputFocused) {
    const newInput = document.getElementById('search-input');
    if (newInput) {
      newInput.focus();
      if (selectionStart !== null) newInput.setSelectionRange(selectionStart, selectionStart);
    }
  } else if (activeEditorId && (activeEditorId === 'page-content-input' || activeEditorId === 'page-title-input')) {
    const newEditor = document.getElementById(activeEditorId);
    if (newEditor) {
      newEditor.focus();
      if (editorSelStart !== null) newEditor.setSelectionRange(editorSelStart, editorSelEnd);
    }
  }

  // Manage camera hardware lifecycle
  if (route === '/camera') {
    attachCameraStream();
  } else {
    stopCamera();
  }

  // Bind all interactive event listeners
  attachEventListeners();
}

function attachAuthEventListeners() {
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const authForm = document.getElementById('auth-form');

  if (tabLogin) {
    tabLogin.addEventListener('click', () => {
      isRegistering = false;
      authErrorMessage = '';
      notify();
    });
  }

  if (tabRegister) {
    tabRegister.addEventListener('click', () => {
      isRegistering = true;
      authErrorMessage = '';
      notify();
    });
  }

  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('auth-email')?.value.trim();
      const password = document.getElementById('auth-password')?.value;

      if (!email || !password) return;

      const submitBtn = document.getElementById('btn-auth-submit');
      const submitText = document.getElementById('btn-auth-text');
      if (submitBtn) submitBtn.disabled = true;
      if (submitText) submitText.textContent = isRegistering ? 'CREATING...' : 'AUTHENTICATING...';

      try {
        if (isRegistering) {
          await register(email, password);
        } else {
          await login(email, password);
        }

        // Fetch user data and initial notebooks
        const user = { email };
        state.user = user;
        authErrorMessage = '';
        state.notebooksLoading = true;
        notify();

        state.notebooks = await listNotebooks().catch(() => []);
        loadStoredPhotos();
      } catch (err) {
        authErrorMessage = err.message || 'Authentication failed. Please verify credentials.';
      } finally {
        state.notebooksLoading = false;
        notify();
      }
    });
  }
}

function attachEventListeners() {
  // Global Logout
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      try {
        await logout();
      } catch (_) { }
      state.user = null;
      state.notebooks = [];
      state.currentNotebook = null;
      state.currentChapter = null;
      state.currentPage = null;
      setRoute('/');
    });
  }

  // --- Search ---
  const navSearchBtn = document.getElementById('nav-search-btn');
  if (navSearchBtn) {
    navSearchBtn.addEventListener('click', () => toggleSearch());
  }

  const closeSearchBtn = document.getElementById('close-search-btn');
  if (closeSearchBtn) {
    closeSearchBtn.addEventListener('click', () => {
      if (state.searchTerm) {
        setSearchTerm('');
      } else {
        closeSearch();
      }
    });
  }

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      setSearchTerm(e.target.value);
    });
  }

  // --- Notebooks CRUD ---
  const btnShowCreateNotebook = document.getElementById('btn-show-create-notebook');
  const createNotebookPanel = document.getElementById('create-notebook-panel');
  const btnCancelCreateNotebook = document.getElementById('btn-cancel-create-notebook');
  const formCreateNotebook = document.getElementById('form-create-notebook');

  if (btnShowCreateNotebook && createNotebookPanel) {
    btnShowCreateNotebook.addEventListener('click', () => {
      createNotebookPanel.classList.remove('hidden');
      document.getElementById('input-notebook-name')?.focus();
    });
  }

  if (btnCancelCreateNotebook && createNotebookPanel) {
    btnCancelCreateNotebook.addEventListener('click', () => {
      createNotebookPanel.classList.add('hidden');
    });
  }

  if (formCreateNotebook) {
    formCreateNotebook.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('input-notebook-name')?.value.trim();
      const desc = document.getElementById('input-notebook-desc')?.value.trim();
      if (!name) return;

      try {
        const created = await createNotebook({ name, description: desc });
        state.notebooks.unshift(created);
        createNotebookPanel?.classList.add('hidden');
        notify();
      } catch (err) {
        alert(err.message || 'Failed to create notebook');
      }
    });
  }

  // Notebook Card click -> View Notebook Chapters
  document.querySelectorAll('[data-notebook-card]').forEach((card) => {
    card.addEventListener('click', async (e) => {
      if (e.target.closest('[data-delete-notebook]')) return;
      const nbId = card.getAttribute('data-notebook-card');
      if (!nbId) return;

      try {
        const fullNb = await getNotebook(nbId);
        const chapters = await listChapters(nbId);
        fullNb.chapters = chapters;
        state.currentNotebook = fullNb;
        setRoute(`/notebooks/${nbId}`);
      } catch (err) {
        alert(err.message || 'Failed to load notebook');
      }
    });
  });

  // Delete Notebook
  document.querySelectorAll('[data-delete-notebook]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const nbId = btn.getAttribute('data-delete-notebook');
      if (!nbId) return;
      if (!confirm('Permanently delete this notebook and all its chapters?')) return;

      try {
        await deleteNotebook(nbId);
        state.notebooks = state.notebooks.filter((nb) => nb.id !== nbId);
        notify();
      } catch (err) {
        alert(err.message || 'Failed to delete notebook');
      }
    });
  });

  // --- Chapters CRUD ---
  const btnBackToNotebooks = document.getElementById('btn-back-to-notebooks');
  if (btnBackToNotebooks) {
    btnBackToNotebooks.addEventListener('click', () => {
      state.currentNotebook = null;
      setRoute('/');
    });
  }

  const btnShowCreateChapter = document.getElementById('btn-show-create-chapter');
  const createChapterPanel = document.getElementById('create-chapter-panel');
  const btnCancelCreateChapter = document.getElementById('btn-cancel-create-chapter');
  const formCreateChapter = document.getElementById('form-create-chapter');

  if (btnShowCreateChapter && createChapterPanel) {
    btnShowCreateChapter.addEventListener('click', () => {
      createChapterPanel.classList.remove('hidden');
      document.getElementById('input-chapter-name')?.focus();
    });
  }

  if (btnCancelCreateChapter && createChapterPanel) {
    btnCancelCreateChapter.addEventListener('click', () => {
      createChapterPanel.classList.add('hidden');
    });
  }

  if (formCreateChapter && state.currentNotebook) {
    formCreateChapter.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('input-chapter-name')?.value.trim();
      if (!name) return;

      try {
        const created = await createChapter(state.currentNotebook.id, { name });
        if (!state.currentNotebook.chapters) state.currentNotebook.chapters = [];
        state.currentNotebook.chapters.push(created);
        createChapterPanel?.classList.add('hidden');
        notify();
      } catch (err) {
        alert(err.message || 'Failed to create chapter');
      }
    });
  }

  // Chapter Card click -> View Pages in Chapter
  document.querySelectorAll('[data-chapter-card]').forEach((card) => {
    card.addEventListener('click', async (e) => {
      if (e.target.closest('[data-delete-chapter]')) return;
      const chId = card.getAttribute('data-chapter-card');
      if (!chId || !state.currentNotebook) return;

      try {
        const pages = await listPages(chId);
        state.currentChapter = {
          id: chId,
          name: card.querySelector('h3')?.textContent?.trim() || 'Chapter',
          pages: pages || [],
        };
        state.currentPage = pages.length > 0 ? pages[0] : null;
        setRoute(`/notebooks/${state.currentNotebook.id}/chapters/${chId}`);
      } catch (err) {
        alert(err.message || 'Failed to open chapter');
      }
    });
  });

  // Delete Chapter
  document.querySelectorAll('[data-delete-chapter]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const chId = btn.getAttribute('data-delete-chapter');
      if (!chId) return;
      if (!confirm('Permanently delete this chapter and all its pages?')) return;

      try {
        await deleteChapter(chId);
        if (state.currentNotebook && state.currentNotebook.chapters) {
          state.currentNotebook.chapters = state.currentNotebook.chapters.filter((c) => c.id !== chId);
        }
        notify();
      } catch (err) {
        alert(err.message || 'Failed to delete chapter');
      }
    });
  });

  // --- Pages & Editor ---
  const btnBackToChapters = document.getElementById('btn-back-to-chapters');
  if (btnBackToChapters && state.currentNotebook) {
    btnBackToChapters.addEventListener('click', () => {
      state.currentChapter = null;
      state.currentPage = null;
      setRoute(`/notebooks/${state.currentNotebook.id}`);
    });
  }

  // Page switcher tab
  document.querySelectorAll('[data-select-page]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const pageId = btn.getAttribute('data-select-page');
      if (!pageId || (state.currentPage && state.currentPage.id === pageId)) return;

      try {
        const fullPage = await getPage(pageId);
        state.currentPage = fullPage;
        state.saveStatus = 'saved';
        notify();
      } catch (err) {
        console.warn('Failed to switch page:', err);
      }
    });
  });

  // Create new page
  const btnCreatePage = document.getElementById('btn-create-page') || document.getElementById('btn-create-first-page');
  if (btnCreatePage && state.currentChapter) {
    btnCreatePage.addEventListener('click', async () => {
      try {
        const newPage = await createPage(state.currentChapter.id, {
          title: `Page ${(state.currentChapter.pages?.length || 0) + 1}`,
          content: '',
        });
        if (!state.currentChapter.pages) state.currentChapter.pages = [];
        state.currentChapter.pages.push(newPage);
        state.currentPage = newPage;
        state.saveStatus = 'saved';
        notify();
      } catch (err) {
        alert(err.message || 'Failed to create page');
      }
    });
  }

  // Delete current page
  const btnDeletePage = document.getElementById('btn-delete-current-page');
  if (btnDeletePage && state.currentPage) {
    btnDeletePage.addEventListener('click', async () => {
      if (!confirm(`Delete page "${state.currentPage.title}"?`)) return;
      const pid = state.currentPage.id;

      try {
        await deletePage(pid);
        if (state.currentChapter && state.currentChapter.pages) {
          state.currentChapter.pages = state.currentChapter.pages.filter((p) => p.id !== pid);
          state.currentPage = state.currentChapter.pages.length > 0 ? state.currentChapter.pages[0] : null;
        }
        notify();
      } catch (err) {
        alert(err.message || 'Failed to delete page');
      }
    });
  }

  // Editor Autosave on Title or Content Change
  const pageTitleInput = document.getElementById('page-title-input');
  const pageContentInput = document.getElementById('page-content-input');

  function scheduleAutoSave() {
    if (!state.currentPage) return;
    const pageId = state.currentPage.id;
    const title = pageTitleInput?.value ?? state.currentPage.title;
    const content = pageContentInput?.value ?? state.currentPage.content;

    state.currentPage.title = title;
    state.currentPage.content = content;
    try {
      sessionStorage.setItem(`draft:${pageId}`, JSON.stringify({ title, content, time: Date.now() }));
    } catch (_) { }

    state.saveStatus = 'unsaved';

    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      state.saveStatus = 'saving';
      notify();

      try {
        await updatePage(pageId, { title, content });
        state.saveStatus = 'saved';
        try {
          sessionStorage.removeItem(`draft:${pageId}`);
        } catch (_) { }
      } catch (err) {
        console.error('Autosave failed:', err);
        state.saveStatus = 'failed';
      } finally {
        notify();
      }
    }, 1500);
  }

  if (pageTitleInput) pageTitleInput.addEventListener('input', scheduleAutoSave);
  if (pageContentInput) pageContentInput.addEventListener('input', scheduleAutoSave);

  // Page Upload: Attach image to active page
  const inputPageUpload = document.getElementById('input-page-upload');
  if (inputPageUpload && state.currentPage) {
    inputPageUpload.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const upload = await uploadPhoto(state.currentPage.id, file);
        if (!state.currentPage.uploads) state.currentPage.uploads = [];
        state.currentPage.uploads.push(upload);
        notify();
      } catch (err) {
        alert(err.message || 'Upload failed');
      }
    });
  }

  // Delete Page Upload
  document.querySelectorAll('[data-delete-page-upload]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const uid = btn.getAttribute('data-delete-page-upload');
      if (!uid) return;

      try {
        await deleteUpload(uid);
        if (state.currentPage && state.currentPage.uploads) {
          state.currentPage.uploads = state.currentPage.uploads.filter((u) => u.id !== uid);
        }
        notify();
      } catch (err) {
        alert(err.message || 'Failed to delete attachment');
      }
    });
  });

  // --- Camera Controls ---
  const shutterTrigger = document.getElementById('shutter-trigger');
  if (shutterTrigger) {
    shutterTrigger.addEventListener('click', () => captureSnapshot());
  }

  const btnFlipCamera = document.getElementById('btn-flip-camera');
  if (btnFlipCamera) {
    btnFlipCamera.addEventListener('click', () => toggleCameraFacing());
  }

  const btnRetryCamera = document.getElementById('btn-retry-camera');
  if (btnRetryCamera) {
    btnRetryCamera.addEventListener('click', () => startCamera());
  }

  const btnQuickRatio = document.getElementById('btn-quick-ratio');
  if (btnQuickRatio) {
    btnQuickRatio.addEventListener('click', () => nextRatio());
  }

  // --- AI Analysis Controls (analysis runs automatically after capture) ---
  const btnRetryAI = document.getElementById('btn-retry-ai');
  if (btnRetryAI) {
    btnRetryAI.addEventListener('click', () => analyzeLastCapture());
  }

  const btnCloseAIModal = document.getElementById('btn-close-ai-modal');
  if (btnCloseAIModal) {
    btnCloseAIModal.addEventListener('click', () => discardAIAnalysis());
  }

  const btnDiscardAI = document.getElementById('btn-discard-ai');
  if (btnDiscardAI) {
    btnDiscardAI.addEventListener('click', () => discardAIAnalysis());
  }

  const btnConfirmAI = document.getElementById('btn-confirm-ai');
  if (btnConfirmAI) {
    btnConfirmAI.addEventListener('click', () => confirmAIAnalysis());
  }

  // --- Gallery Controls ---
  document.querySelectorAll('[data-delete-photo]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const photoId = btn.getAttribute('data-delete-photo');
      if (!photoId) return;

      try {
        await deleteUpload(photoId);
      } catch (_) { }
      deletePhoto(photoId);
    });
  });

  const btnClearAll = document.getElementById('btn-clear-gallery');
  if (btnClearAll) {
    btnClearAll.addEventListener('click', () => {
      if (confirm('Clear all captured optical records from storage?')) {
        clearAllPhotos();
      }
    });
  }

  document.querySelectorAll('[data-view-photo]').forEach((item) => {
    item.addEventListener('click', () => {
      const photoUrl = item.getAttribute('data-view-photo');
      if (photoUrl) {
        previewModalPhoto = photoUrl;
        const container = document.getElementById('app');
        if (container) renderApp(container);
      }
    });
  });

  const btnCloseModal = document.getElementById('btn-close-modal');
  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
      previewModalPhoto = null;
      const container = document.getElementById('app');
      if (container) renderApp(container);
    });
  }

  // --- Settings Controls ---
  const btnMode = document.getElementById('btn-mode');
  if (btnMode) btnMode.addEventListener('click', () => nextMode());

  const btnTone = document.getElementById('btn-tone');
  if (btnTone) btnTone.addEventListener('click', () => nextTone());

  const btnRatio = document.getElementById('btn-ratio');
  if (btnRatio) btnRatio.addEventListener('click', () => nextRatio());

  const hapticToggle = document.getElementById('haptic-toggle');
  if (hapticToggle) hapticToggle.addEventListener('click', () => toggleHaptics());

  const btnPrivacy = document.getElementById('btn-privacy');
  if (btnPrivacy) btnPrivacy.addEventListener('click', () => togglePrivacy());

  const btnBack = document.getElementById('btn-back');
  if (btnBack) btnBack.addEventListener('click', () => goBack());
}
