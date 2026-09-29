/**
 * SearchOverlay Component
 * Floating search bar overlay.
 */

export function renderSearchOverlay(isOpen, searchTerm = "", placeholder = "Search notes...") {
  const icon = searchTerm ? 'close' : 'search';

  return `
    <div 
      id="floating-search-bar" 
      class="fixed inset-x-4 bottom-24 z-50 transition-all duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none translate-y-3'
      }"
    >
      <div class="max-w-md mx-auto w-full bg-surface-container-high/90 backdrop-blur-xl border border-surface-container-highest/60 rounded-full h-11 px-4 flex items-center justify-between shadow-[0_12px_32px_-4px_rgba(0,0,0,0.7)] focus-within:border-primary transition-colors pointer-events-auto">
        <div class="flex items-center gap-2 flex-1">
          <span class="font-label-sm text-xs text-outline tracking-widest">······</span>
          <input 
            id="search-input" 
            value="${searchTerm}"
            class="bg-transparent text-sm text-on-surface placeholder:text-outline-variant focus:outline-none w-full font-body-md" 
            placeholder="${placeholder}" 
            type="text" 
          />
        </div>
        <button 
          id="close-search-btn" 
          type="button" 
          class="text-on-surface-variant hover:text-on-surface flex items-center justify-center p-1 focus:outline-none"
        >
          <span class="material-symbols-outlined text-[20px]">${icon}</span>
        </button>
      </div>
    </div>
  `;
}
