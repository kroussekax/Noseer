/**
 * NavigationBar Component
 * Global floating bottom navigation bar for switching screens and opening search.
 */

export function renderNavBar(activeTab) {
  const isNotes = activeTab === 'notes';
  const isCamera = activeTab === 'camera';
  const isGallery = activeTab === 'gallery';

  return `
    <nav class="fixed bottom-0 w-full z-50 pb-safe pointer-events-none flex justify-center">
      <div class="pointer-events-auto mb-6 mx-auto flex items-center gap-2">
        <div class="bg-surface-container-high/90 backdrop-blur-xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.7)] rounded-full px-space-sm py-1.5 flex items-center gap-space-xs">
          <a 
            data-link
            aria-label="Notes" 
            href="/" 
            class="rounded-full flex items-center justify-center transition-all active:scale-95 ${
              isNotes
                ? 'min-w-[48px] min-h-[48px] bg-primary text-on-primary shadow-sm'
                : 'min-w-[44px] min-h-[44px] text-on-surface-variant hover:text-on-surface'
            }"
          >
            <span class="material-symbols-outlined text-[22px]">description</span>
          </a>
          
          <a 
            data-link
            aria-label="Active Camera" 
            href="/camera" 
            class="rounded-full flex items-center justify-center transition-all active:scale-95 ${
              isCamera
                ? 'min-w-[48px] min-h-[48px] bg-primary text-on-primary shadow-sm'
                : 'min-w-[44px] min-h-[44px] text-on-surface-variant hover:text-on-surface'
            }"
          >
            <span class="material-symbols-outlined text-[22px]">photo_camera</span>
          </a>
          
          <a 
            data-link
            aria-label="Gallery" 
            href="/gallery" 
            class="rounded-full flex items-center justify-center transition-all active:scale-95 ${
              isGallery
                ? 'min-w-[48px] min-h-[48px] bg-primary text-on-primary shadow-sm'
                : 'min-w-[44px] min-h-[44px] text-on-surface-variant hover:text-on-surface'
            }"
          >
            <span class="material-symbols-outlined text-[22px]">photo_library</span>
          </a>
        </div>

        <button 
          aria-label="Search" 
          type="button"
          id="nav-search-btn"
          class="w-12 h-12 rounded-full flex items-center justify-center bg-surface-container-high/90 backdrop-blur-xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.7)] text-on-surface-variant hover:text-on-surface active:scale-95 transition-all"
        >
          <span class="material-symbols-outlined text-[22px]">search</span>
        </button>
      </div>
    </nav>
  `;
}
