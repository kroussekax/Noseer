import { state, setRoute, notify } from '../state.js';

export function initRouter() {
  // Listen for browser back/forward navigation
  window.addEventListener('popstate', () => {
    state.currentRoute = window.location.pathname || '/';
    notify();
  });

  // Global click delegator for links
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-link]');
    if (link) {
      const href = link.getAttribute('href');
      if (href && href.startsWith('/')) {
        e.preventDefault();
        setRoute(href);
      }
    }
  });
}
