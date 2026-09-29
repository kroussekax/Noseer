import { state, toggleCardOne, bumpCardTwoMetrics, toggleSearch, closeSearch, setSearchTerm, triggerShutter, nextMode, nextTone, nextRatio, toggleHaptics, togglePrivacy, goBack } from './state.js';
import { renderNotesPage } from './pages/notes.js';
import { renderCameraPage } from './pages/camera.js';
import { renderGalleryPage } from './pages/gallery.js';
import { renderSettingsPage } from './pages/settings.js';
import { renderNotificationsPage } from './pages/notifications.js';

export function renderApp(container) {
  const route = state.currentRoute;

  // Determine active page component
  let pageHtml = '';
  if (route === '/camera') {
    pageHtml = renderCameraPage(state);
  } else if (route === '/gallery') {
    pageHtml = renderGalleryPage(state);
  } else if (route === '/settings') {
    pageHtml = renderSettingsPage(state);
  } else if (route === '/notifications') {
    pageHtml = renderNotificationsPage(state);
  } else {
    // Default to notes page
    pageHtml = renderNotesPage(state);
  }

  // Preserve search input state if active
  const searchInput = document.getElementById('search-input');
  const isInputFocused = document.activeElement === searchInput;
  const selectionStart = searchInput ? searchInput.selectionStart : null;

  container.innerHTML = pageHtml;

  // Restore search input focus if it was focused before re-render
  if (isInputFocused) {
    const newInput = document.getElementById('search-input');
    if (newInput) {
      newInput.focus();
      if (selectionStart !== null) {
        newInput.setSelectionRange(selectionStart, selectionStart);
      }
    }
  }

  // Bind interactive event listeners
  attachEventListeners();
}

function attachEventListeners() {
  // Card 1
  const cardOne = document.getElementById('tactile-card-1');
  if (cardOne) {
    cardOne.addEventListener('click', () => toggleCardOne());
  }

  // Card 2
  const cardTwo = document.getElementById('tactile-card-2');
  if (cardTwo) {
    cardTwo.addEventListener('click', () => bumpCardTwoMetrics());
  }

  // Nav Search Button
  const navSearchBtn = document.getElementById('nav-search-btn');
  if (navSearchBtn) {
    navSearchBtn.addEventListener('click', () => toggleSearch());
  }

  // Close Search Button
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

  // Search Input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      setSearchTerm(e.target.value);
    });
  }

  // Camera Shutter Trigger
  const shutterTrigger = document.getElementById('shutter-trigger');
  if (shutterTrigger) {
    shutterTrigger.addEventListener('click', () => triggerShutter());
  }

  // Settings: Display Mode
  const btnMode = document.getElementById('btn-mode');
  if (btnMode) {
    btnMode.addEventListener('click', () => nextMode());
  }

  // Settings: Accent Tone
  const btnTone = document.getElementById('btn-tone');
  if (btnTone) {
    btnTone.addEventListener('click', () => nextTone());
  }

  // Settings: Viewfinder Ratio
  const btnRatio = document.getElementById('btn-ratio');
  if (btnRatio) {
    btnRatio.addEventListener('click', () => nextRatio());
  }

  // Settings: Haptic Toggle
  const hapticToggle = document.getElementById('haptic-toggle');
  if (hapticToggle) {
    hapticToggle.addEventListener('click', () => toggleHaptics());
  }

  // Settings: Privacy Toggle
  const btnPrivacy = document.getElementById('btn-privacy');
  if (btnPrivacy) {
    btnPrivacy.addEventListener('click', () => togglePrivacy());
  }

  // Notifications: Back Button
  const btnBack = document.getElementById('btn-back');
  if (btnBack) {
    btnBack.addEventListener('click', () => goBack());
  }
}
