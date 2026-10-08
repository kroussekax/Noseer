import { renderHeader } from '../components/header.js';
import { renderTactileCardGrid } from '../components/tactile-card-grid.js';
import { renderSearchOverlay } from '../components/search-overlay.js';
import { renderNavBar } from '../components/nav-bar.js';

export function renderGalleryPage(state, previewPhoto = null) {
  const photos = state.camera.capturedPhotos || [];

  return `
    <div class="min-h-screen flex flex-col bg-surface text-on-surface selection:bg-surface-container-highest relative">
      ${renderHeader("Gallery")}
      
      <main class="flex-1 flex flex-col relative w-full pt-16 pb-28 px-margin bg-surface max-w-lg mx-auto">
        
        <!-- Camera Captures Section -->
        <div class="flex flex-col w-full mb-8 pt-6 select-none">
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-dashed border-outline-variant/30">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span class="font-label-sm text-[11px] text-outline font-semibold tracking-wider uppercase">
                OPTICAL ARCHIVE (${photos.length})
              </span>
            </div>
            ${photos.length > 0 ? `
              <button 
                id="btn-clear-gallery" 
                type="button" 
                class="font-label-sm text-[10px] text-outline hover:text-error transition-colors uppercase tracking-wider flex items-center gap-1"
              >
                <span class="material-symbols-outlined text-[13px]">delete_sweep</span>
                <span>CLEAR</span>
              </button>
            ` : ''}
          </div>

          ${photos.length > 0 ? `
            <div class="grid grid-cols-2 gap-3.5 w-full">
              ${photos.map((photo) => `
                <div class="tactile-card group relative bg-surface-container rounded-2xl overflow-hidden border border-surface-container-highest/50 shadow-sm flex flex-col">
                  <!-- Photo Thumbnail View -->
                  <div 
                    data-view-photo="${photo.url}" 
                    class="relative aspect-[4/3] w-full overflow-hidden bg-black cursor-pointer"
                  >
                    <img 
                      src="${photo.url}" 
                      alt="Capture ${photo.timestamp}" 
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity"></div>
                    
                    <span class="absolute bottom-1.5 left-2 font-label-sm text-[9px] text-white/80 bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm uppercase">
                      ${photo.ratio || '4:3'}
                    </span>
                  </div>

                  <!-- Metadata & Action Footer -->
                  <div class="p-2.5 flex items-center justify-between bg-surface-container">
                    <span class="font-label-sm text-[10px] text-outline tracking-wider">
                      ${photo.timestamp}
                    </span>
                    <div class="flex items-center gap-1">
                      <a 
                        href="${photo.url}" 
                        download="capture_${photo.id}.jpg" 
                        title="Download Photo"
                        class="w-7 h-7 rounded-lg flex items-center justify-center text-outline hover:text-primary hover:bg-surface-container-high transition-colors"
                      >
                        <span class="material-symbols-outlined text-[15px]">download</span>
                      </a>
                      <button 
                        data-delete-photo="${photo.id}" 
                        title="Delete Capture"
                        type="button" 
                        class="w-7 h-7 rounded-lg flex items-center justify-center text-outline hover:text-error hover:bg-surface-container-high transition-colors"
                      >
                        <span class="material-symbols-outlined text-[15px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="tactile-card bg-surface-container rounded-2xl p-6 border border-dashed border-outline-variant/40 flex flex-col items-center justify-center text-center">
              <div class="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center mb-3 text-outline">
                <span class="material-symbols-outlined text-[28px]">photo_camera</span>
              </div>
              <h3 class="font-label-md text-xs font-bold uppercase tracking-wider text-on-surface mb-1">
                NO OPTICAL CAPTURES YET
              </h3>
              <p class="font-body-md text-xs text-on-surface-variant max-w-xs mb-4">
                Use the live viewfinder camera to record high-resolution frames directly to your hardware vault.
              </p>
              <a 
                data-link 
                href="/camera" 
                class="px-4 py-2 rounded-full bg-primary text-on-primary font-label-md text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm active:scale-95 transition-transform"
              >
                <span class="material-symbols-outlined text-[16px]">photo_camera</span>
                <span>OPEN VIEWFINDER</span>
              </a>
            </div>
          `}
        </div>

        <!-- System Storage & Tactile Ledger Cards -->
        <div class="flex flex-col w-full select-none">
          <div class="flex items-center gap-2 pb-2 mb-3 border-b border-dashed border-outline-variant/30">
            <span class="font-label-sm text-[11px] text-outline font-semibold tracking-wider uppercase">
              ENCRYPTED ASSETS
            </span>
          </div>
          <div class="flex flex-col gap-4 w-full">
            ${renderTactileCardGrid(state.cardOneActive, state.cardTwoValue)}
          </div>
        </div>

        ${renderSearchOverlay(state.searchOpen, state.searchTerm, "Search gallery & assets...")}
      </main>

      <!-- Lightbox Photo Preview Modal -->
      ${previewPhoto ? `
        <div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl p-4 select-none">
          <div class="absolute top-4 right-4 z-10 flex items-center gap-3">
            <a 
              href="${previewPhoto}" 
              download="tactile_capture.jpg"
              class="w-10 h-10 rounded-full bg-surface-container-high/90 text-on-surface hover:text-primary flex items-center justify-center border border-white/10 shadow-lg active:scale-95 transition-transform"
              title="Download Full Resolution"
            >
              <span class="material-symbols-outlined text-[20px]">download</span>
            </a>
            <button 
              id="btn-close-modal" 
              type="button" 
              class="w-10 h-10 rounded-full bg-surface-container-high/90 text-on-surface hover:text-primary flex items-center justify-center border border-white/10 shadow-lg active:scale-95 transition-transform"
              title="Close Preview"
            >
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div class="relative max-w-full max-h-[80vh] flex items-center justify-center rounded-2xl overflow-hidden border border-white/15 shadow-2xl">
            <img src="${previewPhoto}" alt="Full resolution optical capture" class="max-w-full max-h-[80vh] object-contain">
          </div>
          
          <div class="mt-4 flex items-center gap-2 font-label-sm text-xs text-outline tracking-widest uppercase">
            <span class="w-2 h-2 rounded-full bg-primary"></span>
            <span>RAW CAPTURE • SENSOR RECORD</span>
          </div>
        </div>
      ` : ''}

      ${renderNavBar("gallery")}
    </div>
  `;
}
