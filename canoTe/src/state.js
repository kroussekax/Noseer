/**
 * Central State Management
 * Simple object holding application state with listener subscriptions.
 */

export const state = {
  currentRoute: window.location.pathname || '/',
  previousRoute: '/',
  cardOneActive: false,
  cardTwoValue: 1420.50,
  searchOpen: false,
  searchTerm: '',
  camera: {
    flashing: false,
    captureCount: 0,
  },
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
  if (window.history.length > 1 && state.previousRoute) {
    const target = state.previousRoute;
    state.previousRoute = state.currentRoute;
    state.currentRoute = target;
    window.history.pushState({}, '', target);
    notify();
  } else {
    setRoute('/');
  }
}

// Tactile card actions
export function toggleCardOne() {
  state.cardOneActive = !state.cardOneActive;
  notify();
}

export function bumpCardTwoMetrics() {
  state.cardTwoValue = Number((state.cardTwoValue + 120.25).toFixed(2));
  notify();
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

// Settings actions
export function nextMode() {
  state.settings.modeIndex = (state.settings.modeIndex + 1) % state.settings.modes.length;
  notify();
}

export function nextTone() {
  state.settings.toneIndex = (state.settings.toneIndex + 1) % state.settings.tones.length;
  notify();
}

export function nextRatio() {
  state.settings.ratioIndex = (state.settings.ratioIndex + 1) % state.settings.ratios.length;
  notify();
}

export function toggleHaptics() {
  state.settings.hapticOn = !state.settings.hapticOn;
  notify();
}

export function togglePrivacy() {
  state.settings.privacyOn = !state.settings.privacyOn;
  notify();
}
