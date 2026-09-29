import './styles/style.css';
import { subscribe } from './state.js';
import { initRouter } from './utils/router.js';
import { renderApp } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('app');

  // Initialize router navigation listeners
  initRouter();

  // Render application on state change
  subscribe(() => {
    renderApp(container);
  });

  // Initial render
  renderApp(container);
});
