import { renderHeader } from '../components/header.js';
import { renderSearchOverlay } from '../components/search-overlay.js';
import { renderNavBar } from '../components/nav-bar.js';

export function renderChapterDetailPage(state) {
  const chapter = state.currentChapter || { name: 'CHAPTER', pages: [] };
  const pages = chapter.pages || [];
  const currentPage = state.currentPage || (pages.length > 0 ? pages[0] : null);

  const saveStatusMap = {
    saved:    { text: 'SAVED', icon: 'check_circle', color: 'text-primary' },
    saving:   { text: 'SAVING...', icon: 'sync', color: 'text-outline animate-spin' },
    unsaved:  { text: 'UNSAVED CHANGES', icon: 'edit', color: 'text-outline-variant' },
    failed:   { text: 'SAVE FAILED (RETRYING)', icon: 'warning', color: 'text-error' },
  };

  const currentStatus = saveStatusMap[state.saveStatus] || saveStatusMap.saved;

  return `
    <div class="min-h-screen flex flex-col bg-surface text-on-surface selection:bg-surface-container-highest">
      ${renderHeader("PAGES")}

      <main class="flex-1 flex flex-col relative w-full pt-20 pb-28 px-margin bg-surface">
        <div class="flex flex-col w-full max-w-2xl mx-auto space-y-4 pt-4 select-none">

          <!-- Top Navigation & Controls -->
          <div class="flex items-center justify-between px-1">
            <button
              id="btn-back-to-chapters"
              type="button"
              class="flex items-center gap-1 text-xs font-label-md text-outline hover:text-on-surface transition-colors"
            >
              <span class="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>${escapeHtml(chapter.name || 'CHAPTER')}</span>
            </button>

            <!-- Save Status Indicator -->
            <div class="flex items-center gap-1.5 font-label-sm text-[10px] ${currentStatus.color}">
              <span class="material-symbols-outlined text-[14px]">${currentStatus.icon}</span>
              <span>${currentStatus.text}</span>
            </div>
          </div>

          <!-- Page Switcher Tabs -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            ${pages.map((pg, idx) => {
              const isActive = currentPage && currentPage.id === pg.id;
              return `
                <button
                  type="button"
                  data-select-page="${pg.id}"
                  class="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-label-md transition-all ${
                    isActive
                      ? 'bg-primary text-on-primary border-primary shadow-sm font-bold'
                      : 'bg-surface-container text-outline border-surface-container-highest/60 hover:text-on-surface'
                  }"
                >
                  <span>${escapeHtml(pg.title || `PAGE ${idx + 1}`)}</span>
                </button>
              `;
            }).join('')}

            <button
              id="btn-create-page"
              type="button"
              class="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-surface-container rounded-full border border-dashed border-outline-variant/60 text-xs font-label-md text-primary hover:border-primary transition-colors"
            >
              <span class="material-symbols-outlined text-[15px]">add</span>
              <span>ADD PAGE</span>
            </button>
          </div>

          ${!currentPage ? `
            <div class="tactile-card bg-surface-container/50 border border-dashed border-outline-variant/40 rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-3">
              <span class="material-symbols-outlined text-[40px] text-outline-variant">description</span>
              <span class="font-label-md text-xs text-outline tracking-wider uppercase">NO PAGES IN THIS CHAPTER</span>
              <button
                id="btn-create-first-page"
                type="button"
                class="px-4 py-2 bg-primary text-on-primary rounded-xl font-label-md text-xs font-bold uppercase transition-transform active:scale-[0.98]"
              >
                CREATE FIRST PAGE
              </button>
            </div>
          ` : `
            <!-- Editor Card -->
            <div class="tactile-card bg-surface-container rounded-2xl p-5 border border-surface-container-highest/50 shadow-sm flex flex-col space-y-4">

              <!-- Page Title & Actions -->
              <div class="flex items-center justify-between pb-3 border-b border-dashed border-outline-variant/30 gap-2">
                <input
                  id="page-title-input"
                  type="text"
                  value="${escapeHtml(currentPage.title || '')}"
                  placeholder="Page Title..."
                  class="flex-1 bg-transparent font-headline-md text-lg font-bold text-on-surface placeholder:text-outline-variant/40 focus:outline-none"
                />
                <button
                  id="btn-delete-current-page"
                  type="button"
                  data-page-id="${currentPage.id}"
                  aria-label="Delete Page"
                  class="p-1.5 text-outline hover:text-error transition-colors"
                >
                  <span class="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>

              <!-- Page Content Editor -->
              <div>
                <textarea
                  id="page-content-input"
                  rows="12"
                  placeholder="Type tactile notes, transcriptions, markdown, or optical analysis..."
                  class="w-full bg-surface-container-highest/30 border border-outline-variant/20 rounded-xl p-3.5 font-body-md text-sm text-on-surface leading-relaxed placeholder:text-outline-variant/40 focus:outline-none focus:border-outline-variant/60 transition-colors resize-y"
                >${escapeHtml(currentPage.content || '')}</textarea>
              </div>

              <!-- Attachments / Uploads Section -->
              <div class="pt-3 border-t border-dashed border-outline-variant/30">
                <div class="flex items-center justify-between mb-3">
                  <span class="font-label-sm text-[10px] text-outline uppercase font-semibold tracking-wider">
                    ATTACHED MEDIA (${(currentPage.uploads || []).length})
                  </span>
                  <label class="flex items-center gap-1 text-xs font-label-md text-primary cursor-pointer hover:underline">
                    <span class="material-symbols-outlined text-[15px]">upload</span>
                    <span>ATTACH FILE</span>
                    <input id="input-page-upload" type="file" accept="image/*" class="hidden" />
                  </label>
                </div>

                ${(currentPage.uploads || []).length > 0 ? `
                  <div class="grid grid-cols-3 gap-2">
                    ${currentPage.uploads.map(u => `
                      <div class="relative group rounded-xl overflow-hidden aspect-video bg-surface-container-highest border border-outline-variant/30">
                        <img src="${u.url}" alt="Attachment" class="w-full h-full object-cover" />
                        <button
                          type="button"
                          data-delete-page-upload="${u.id}"
                          class="absolute top-1 right-1 p-1 bg-surface/80 rounded-full text-error opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span class="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </div>
                    `).join('')}
                  </div>
                ` : `
                  <div class="text-xs font-body-md text-outline-variant/70 italic">
                    No images attached to this page. Use the camera or upload a file.
                  </div>
                `}
              </div>

            </div>
          `}

        </div>
        ${renderSearchOverlay(state.searchOpen, state.searchTerm, "Search page contents...")}
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
