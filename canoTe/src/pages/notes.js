import { renderHeader } from '../components/header.js';
import { renderTactileCardGrid } from '../components/tactile-card-grid.js';
import { renderSearchOverlay } from '../components/search-overlay.js';
import { renderNavBar } from '../components/nav-bar.js';

export function renderNotesPage(state) {
  return `
    <div class="min-h-screen flex flex-col bg-surface text-on-surface selection:bg-surface-container-highest">
      ${renderHeader("NOTES")}
      <main class="flex-1 flex flex-col relative w-full pt-14 pb-28 px-margin bg-surface">
        <div class="flex flex-col w-full h-full min-h-[calc(100vh-140px)] justify-between select-none pt-16 pb-24 px-margin">
          <div class="flex flex-col gap-4 w-full">
            ${renderTactileCardGrid(state.cardOneActive, state.cardTwoValue)}
          </div>
        </div>
        ${renderSearchOverlay(state.searchOpen, state.searchTerm, "Search notes...")}
      </main>
      ${renderNavBar("notes")}
    </div>
  `;
}
