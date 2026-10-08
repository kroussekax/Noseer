import { renderHeader } from '../components/header.js';
import { renderSearchOverlay } from '../components/search-overlay.js';
import { renderNavBar } from '../components/nav-bar.js';

export function renderNotebookDetailPage(state) {
  const notebook = state.currentNotebook || { name: 'NOTEBOOK', chapters: [] };
  const chapters = notebook.chapters || [];

  return `
    <div class="min-h-screen flex flex-col bg-surface text-on-surface selection:bg-surface-container-highest">
      ${renderHeader("CHAPTERS")}

      <main class="flex-1 flex flex-col relative w-full pt-20 pb-28 px-margin bg-surface">
        <div class="flex flex-col w-full max-w-lg mx-auto space-y-4 pt-4 select-none">

          <!-- Breadcrumb & Back -->
          <div class="flex items-center justify-between px-1">
            <button
              id="btn-back-to-notebooks"
              type="button"
              class="flex items-center gap-1 text-xs font-label-md text-outline hover:text-on-surface transition-colors"
            >
              <span class="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>ALL NOTEBOOKS</span>
            </button>
            <button
              id="btn-show-create-chapter"
              type="button"
              class="flex items-center gap-1 px-3 py-1 bg-surface-container rounded-full border border-surface-container-highest/60 text-xs font-label-md text-primary hover:border-primary/50 transition-colors"
            >
              <span class="material-symbols-outlined text-[16px]">add</span>
              <span>NEW CHAPTER</span>
            </button>
          </div>

          <!-- Notebook Overview Banner -->
          <div class="tactile-card bg-surface-container rounded-2xl p-4 border border-surface-container-highest/50">
            <div class="flex items-center justify-between pb-2 border-b border-dashed border-outline-variant/30">
              <span class="font-label-sm text-[10px] text-primary uppercase font-bold tracking-wider">CURRENT NOTEBOOK</span>
              <span class="font-label-sm text-[10px] text-outline">${chapters.length} CHAPTER${chapters.length === 1 ? '' : 'S'}</span>
            </div>
            <h1 class="font-headline-md text-lg font-bold text-on-surface mt-2">${escapeHtml(notebook.name)}</h1>
            ${notebook.description ? `<p class="font-body-md text-xs text-on-surface-variant mt-1">${escapeHtml(notebook.description)}</p>` : ''}
          </div>

          <!-- Create Chapter Input Panel -->
          <div id="create-chapter-panel" class="hidden tactile-card bg-surface-container rounded-2xl p-4 border border-primary/30 shadow-md">
            <div class="flex items-center justify-between pb-2 border-b border-dashed border-outline-variant/30 mb-3">
              <span class="font-label-sm text-[10px] text-primary uppercase font-bold tracking-wider">NEW CHAPTER</span>
              <button id="btn-cancel-create-chapter" type="button" class="text-outline hover:text-on-surface">
                <span class="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form id="form-create-chapter" class="space-y-3">
              <input
                id="input-chapter-name"
                type="text"
                placeholder="Chapter Title (e.g., Section 1, Field Notes)..."
                required
                class="w-full bg-surface-container-highest/60 border border-outline-variant/30 rounded-xl px-3 py-2 font-body-md text-sm text-on-surface placeholder:text-outline-variant/50 focus:outline-none focus:border-primary"
              />
              <div class="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  class="px-4 py-2 bg-primary text-on-primary rounded-xl font-label-md text-xs font-bold uppercase transition-transform active:scale-[0.98]"
                >
                  CREATE CHAPTER
                </button>
              </div>
            </form>
          </div>

          <!-- Chapter List -->
          ${chapters.length === 0 ? `
            <div class="tactile-card bg-surface-container/50 border border-dashed border-outline-variant/40 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3">
              <span class="material-symbols-outlined text-[36px] text-outline-variant">bookmark_border</span>
              <span class="font-label-md text-xs text-outline tracking-wider uppercase">NO CHAPTERS YET</span>
              <p class="font-body-md text-xs text-outline-variant max-w-xs">
                Add your first chapter to start writing pages inside this notebook.
              </p>
            </div>
          ` : `
            <div class="space-y-3 w-full">
              ${chapters.map((ch, idx) => `
                <div
                  data-chapter-card="${ch.id}"
                  class="tactile-card group relative flex items-center justify-between bg-surface-container rounded-2xl p-4 shadow-sm border border-surface-container-highest/50 cursor-pointer hover:border-outline-variant/60 transition-all active:scale-[0.99]"
                >
                  <div class="flex items-center gap-3">
                    <span class="font-label-md text-xs font-bold text-outline">
                      ${String(idx + 1).padStart(2, '0')}.
                    </span>
                    <div>
                      <h3 class="font-headline-md text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                        ${escapeHtml(ch.name)}
                      </h3>
                      <span class="font-label-sm text-[10px] text-outline-variant">
                        ${ch.pages ? `${ch.pages.length} PAGES` : 'OPEN TO VIEW PAGES'}
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      data-delete-chapter="${ch.id}"
                      aria-label="Delete Chapter"
                      class="p-1.5 text-outline hover:text-error transition-colors"
                    >
                      <span class="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                    <span class="material-symbols-outlined text-[18px] text-outline-variant group-hover:text-primary transition-colors">
                      chevron_right
                    </span>
                  </div>
                </div>
              `).join('')}
            </div>
          `}

        </div>
        ${renderSearchOverlay(state.searchOpen, state.searchTerm, "Search chapters...")}
      </main>
      ${renderNavBar("notes")}
    </div>
  `;
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
