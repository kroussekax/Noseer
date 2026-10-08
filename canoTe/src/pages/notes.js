import { renderHeader } from '../components/header.js';
import { renderSearchOverlay } from '../components/search-overlay.js';
import { renderNavBar } from '../components/nav-bar.js';

export function renderNotesPage(state) {
  const notebooks = state.notebooks || [];
  const query = (state.searchTerm || '').trim().toLowerCase();
  const filtered = query
    ? notebooks.filter(nb => (nb.name || '').toLowerCase().includes(query) || (nb.description || '').toLowerCase().includes(query))
    : notebooks;

  return `
    <div class="min-h-screen flex flex-col bg-surface text-on-surface selection:bg-surface-container-highest">
      ${renderHeader("NOTES")}

      <main class="flex-1 flex flex-col relative w-full pt-20 pb-28 px-margin bg-surface">
        <div class="flex flex-col w-full max-w-lg mx-auto space-y-4 pt-4 select-none">

          <!-- Notebook Creator Trigger / Card -->
          <div class="flex items-center justify-between px-1">
            <span class="font-label-sm text-[11px] text-outline tracking-wider uppercase font-semibold">
              NOTEBOOKS (${notebooks.length})
            </span>
            <button
              id="btn-show-create-notebook"
              type="button"
              class="flex items-center gap-1.5 px-3 py-1 bg-surface-container rounded-full border border-surface-container-highest/60 text-xs font-label-md text-primary hover:border-primary/50 transition-colors"
            >
              <span class="material-symbols-outlined text-[16px]">add</span>
              <span>NEW NOTEBOOK</span>
            </button>
          </div>

          <!-- Create Notebook Input Panel (hidden by default unless active) -->
          <div id="create-notebook-panel" class="hidden tactile-card bg-surface-container rounded-2xl p-4 border border-primary/30 shadow-md">
            <div class="flex items-center justify-between pb-2 border-b border-dashed border-outline-variant/30 mb-3">
              <span class="font-label-sm text-[10px] text-primary uppercase font-bold tracking-wider">CREATE NOTEBOOK</span>
              <button id="btn-cancel-create-notebook" type="button" class="text-outline hover:text-on-surface">
                <span class="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form id="form-create-notebook" class="space-y-3">
              <input
                id="input-notebook-name"
                type="text"
                placeholder="Notebook Title..."
                required
                class="w-full bg-surface-container-highest/60 border border-outline-variant/30 rounded-xl px-3 py-2 font-body-md text-sm text-on-surface placeholder:text-outline-variant/50 focus:outline-none focus:border-primary"
              />
              <input
                id="input-notebook-desc"
                type="text"
                placeholder="Optional description..."
                class="w-full bg-surface-container-highest/60 border border-outline-variant/30 rounded-xl px-3 py-2 font-body-md text-xs text-on-surface placeholder:text-outline-variant/50 focus:outline-none focus:border-primary"
              />
              <div class="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  class="px-4 py-2 bg-primary text-on-primary rounded-xl font-label-md text-xs font-bold uppercase transition-transform active:scale-[0.98]"
                >
                  SAVE NOTEBOOK
                </button>
              </div>
            </form>
          </div>

          <!-- Notebooks Grid / List -->
          ${state.notebooksLoading ? `
            <div class="flex flex-col items-center justify-center py-16 text-outline">
              <span class="material-symbols-outlined animate-spin text-[32px]">progress_activity</span>
              <span class="font-label-md text-xs mt-3 tracking-widest uppercase">LOADING NOTEBOOKS...</span>
            </div>
          ` : filtered.length === 0 ? `
            <div class="tactile-card bg-surface-container/50 border border-dashed border-outline-variant/40 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3">
              <span class="material-symbols-outlined text-[36px] text-outline-variant">menu_book</span>
              <span class="font-label-md text-xs text-outline tracking-wider uppercase">
                ${query ? 'NO NOTEBOOKS MATCHING QUERY' : 'NO NOTEBOOKS IN VAULT'}
              </span>
              <p class="font-body-md text-xs text-outline-variant max-w-xs">
                ${query ? 'Try a different search term or clear the filter.' : 'Organize your field research, optical captures, and thoughts into structured notebooks.'}
              </p>
            </div>
          ` : `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
              ${filtered.map((nb, idx) => {
                const dateStr = nb.updated_at || nb.created_at
                  ? new Date(nb.updated_at || nb.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
                  : 'RECENT';

                return `
                  <div
                    data-notebook-card="${nb.id}"
                    class="tactile-card group relative flex flex-col justify-between min-h-[160px] bg-surface-container rounded-2xl p-4 shadow-md overflow-hidden cursor-pointer border border-surface-container-highest/50 transition-all duration-300 hover:-translate-y-1 hover:border-outline-variant/60 active:scale-[0.98]"
                  >
                    <div class="flex items-center justify-between">
                      <span class="font-label-sm text-[11px] text-outline font-semibold tracking-wider uppercase">
                        ${romanNumeral(idx + 1)}. NOTEBOOK
                      </span>
                      <span class="font-label-sm text-[10px] text-outline-variant uppercase">${dateStr}</span>
                    </div>

                    <div class="my-3 flex flex-col gap-1">
                      <h2 class="font-headline-md text-base font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                        ${escapeHtml(nb.name)}
                      </h2>
                      <p class="font-body-md text-xs text-on-surface-variant line-clamp-2">
                        ${nb.description ? escapeHtml(nb.description) : 'No description provided.'}
                      </p>
                    </div>

                    <div class="pt-2 border-t border-dashed border-outline-variant/30 flex items-center justify-between text-outline-variant">
                      <div class="flex items-center gap-1.5 text-xs font-label-sm text-outline">
                        <span class="material-symbols-outlined text-[14px]">folder_open</span>
                        <span>VIEW CHAPTERS</span>
                      </div>
                      <button
                        type="button"
                        data-delete-notebook="${nb.id}"
                        aria-label="Delete Notebook"
                        class="p-1 hover:text-error transition-colors"
                      >
                        <span class="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}

        </div>
        ${renderSearchOverlay(state.searchOpen, state.searchTerm, "Search notebooks...")}
      </main>
      ${renderNavBar("notes")}
    </div>
  `;
}

function romanNumeral(num) {
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return roman[num - 1] || `${num}`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}
