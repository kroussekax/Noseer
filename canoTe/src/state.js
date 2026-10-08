/**
 * Central State Management
 * Simple object holding application state with listener subscriptions.
 */
import { setPreference } from './utils/preferences.js';

export const state = {
  currentRoute: window.location.pathname || '/',
  previousRoute: '/',

  // Authentication
  user: null,             // { id, email } or null
  authLoading: true,      // true on initial boot check

  // Notes hierarchy
  notebooks: [],
  currentNotebook: null,  // { id, name, description, chapters }
  currentChapter: null,   // { id, name, notebook_id, pages }
  currentPage: null,      // { id, title, content, chapter_id, uploads }
  notebooksLoading: false,

  // Editor save status
  saveStatus: 'saved',    // 'saved' | 'saving' | 'unsaved' | 'failed'

  // Card demo fallback (preserved)
  cardOneActive: false,
  cardTwoValue: 1420.50,

  // Search
  searchOpen: false,
  searchTerm: '',

  // Camera
  camera: {
    flashing: false,
    captureCount: 0,
    streaming: false,
    loading: false,
    error: null,
    facingMode: 'environment',
    lastCapturedPhoto: null,
    capturedPhotos: [],
    uploading: false,
    aiAnalyzing: false,
    aiResult: null,
    aiError: null,
  },

  // Settings
  settings: {
    modes: ['DARK', 'LIGHT', 'OLED'],
    modeIndex: 0,
    tones: ['SLATE', 'MONO', 'INK'],
    toneIndex: 0,
    ratios: ['19.5:9', '4:3', '16:9', '1:1'],
    ratioIndex: 0,
    hapticOn: true,
    privacyOn: true,
  }
};

const listeners = new Set();

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notify() {
  listeners.forEach(fn => fn(state));
}

// Router actions
export function setRoute(path) {
  if (state.currentRoute !== path) {
    state.previousRoute = state.currentRoute;
    state.currentRoute = path;
    window.history.pushState({}, '', path);
    notify();
  }
}

export function goBack() {
  if (window.history.length > 1 && state.previousRoute && state.previousRoute !== state.currentRoute) {
    const target = state.previousRoute;
    state.previousRoute = state.currentRoute;
    state.currentRoute = target;
    window.history.pushState({}, '', target);
    notify();
  } else {
    // Default fallback based on hierarchy
    if (state.currentPage) {
      setRoute(`/notebooks/${state.currentNotebook?.id || ''}/chapters/${state.currentChapter?.id || ''}`);
    } else if (state.currentChapter) {
      setRoute(`/notebooks/${state.currentNotebook?.id || ''}`);
    } else {
      setRoute('/');
    }
  }
}

// Search actions
export function toggleSearch() {
  state.searchOpen = !state.searchOpen;
  notify();
}

export function closeSearch() {
  state.searchOpen = false;
  notify();
}

export function setSearchTerm(term) {
  state.searchTerm = term;
  notify();
}

// Camera actions
export function triggerShutter() {
  state.camera.flashing = true;
  state.camera.captureCount += 1;
  notify();

  setTimeout(() => {
    state.camera.flashing = false;
    notify();
  }, 120);
}

export function deletePhoto(id) {
  state.camera.capturedPhotos = state.camera.capturedPhotos.filter(p => p.id !== id);
  if (state.camera.lastCapturedPhoto && !state.camera.capturedPhotos.some(p => p.url === state.camera.lastCapturedPhoto)) {
    state.camera.lastCapturedPhoto = state.camera.capturedPhotos.length > 0 ? state.camera.capturedPhotos[0].url : null;
  }
  notify();
}

export function clearAllPhotos() {
  state.camera.capturedPhotos = [];
  state.camera.lastCapturedPhoto = null;
  notify();
}

// Settings actions
export function nextMode() {
  const next = (state.settings.modeIndex + 1) % state.settings.modes.length;
  setPreference('modeIndex', next);
}

export function nextTone() {
  const next = (state.settings.toneIndex + 1) % state.settings.tones.length;
  setPreference('toneIndex', next);
}

export function nextRatio() {
  const next = (state.settings.ratioIndex + 1) % state.settings.ratios.length;
  setPreference('ratioIndex', next);
}

export function toggleHaptics() {
  setPreference('hapticOn', !state.settings.hapticOn);
}

export function togglePrivacy() {
  setPreference('privacyOn', !state.settings.privacyOn);
}
