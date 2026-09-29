export function renderCameraPage(state) {
  const { flashing, captureCount } = state.camera;

  return `
    <div class="bg-surface text-on-surface font-body-md text-body-md min-h-screen flex flex-col selection:bg-surface-container-highest relative">
      <main class="flex-1 flex flex-col relative w-full bg-surface">
        <div class="relative w-full h-full min-h-screen flex flex-col justify-between overflow-hidden bg-surface select-none">
          
          <!-- Shutter visual flash overlay -->
          <div 
            id="shutter-flash"
            class="absolute inset-0 bg-primary pointer-events-none transition-opacity duration-150 z-30 ${
              flashing ? 'opacity-90' : 'opacity-0'
            }"
          ></div>

          <!-- Viewfinder grid lines -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div class="w-64 h-64 border border-dashed border-outline rounded-3xl relative">
              <div class="absolute top-2 left-2 text-[10px] font-label-sm tracking-widest text-outline">EV +0.0</div>
              <div class="absolute bottom-2 right-2 text-[10px] font-label-sm tracking-widest text-outline">RAW 48M</div>
            </div>
          </div>

          <!-- Ambient Camera Vignette -->
          <div class="absolute inset-0 bg-gradient-to-b from-surface-container-lowest/60 via-transparent to-surface-container-lowest/80 pointer-events-none"></div>

          <!-- Top Icons -->
          <div class="absolute top-0 right-0 z-30 flex items-center justify-center p-4">
            <div class="flex items-center gap-3 px-4 py-2">
              <a 
                data-link
                aria-label="Alerts" 
                href="/notifications" 
                class="text-on-surface hover:text-primary transition-colors flex items-center justify-center font-label-md text-label-md"
              >
                <span class="material-symbols-outlined text-[20px]">priority_high</span>
              </a>
              <a 
                data-link
                aria-label="Settings" 
                href="/settings" 
                class="text-on-surface hover:text-primary transition-colors flex items-center justify-center font-label-md text-label-md"
              >
                @
              </a>
            </div>
          </div>

          <!-- Shutter and Nav Bar Footer -->
          <div class="relative z-20 w-full mt-auto flex flex-col items-center gap-space-lg pb-safe mb-6 px-margin">
            <div class="flex flex-col items-center gap-2">
              <button 
                aria-label="Capture Shutter" 
                id="shutter-trigger"
                type="button"
                class="relative group w-20 h-20 rounded-full flex items-center justify-center bg-surface-container-high/80 backdrop-blur-xl p-1 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.8)] active:scale-90 transition-transform"
              >
                <div class="absolute inset-0 rounded-full bg-surface-container-highest/60 backdrop-blur-md"></div>
                <div class="absolute inset-1.5 rounded-full bg-surface-container-lowest"></div>
                <div class="relative w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-md group-hover:scale-95 transition-transform">
                  <div class="w-4 h-4 rounded-full bg-surface/10"></div>
                </div>
              </button>
              ${captureCount > 0 ? `
                <span class="font-label-sm text-[10px] text-outline uppercase tracking-wider">
                  ${captureCount} captured
                </span>
              ` : ''}
            </div>

            <div class="flex items-center justify-center gap-2">
              <div class="bg-surface-container-high/90 backdrop-blur-xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.7)] rounded-full px-space-sm py-1.5 flex items-center gap-space-xs">
                <a 
                  data-link
                  aria-label="Notes" 
                  href="/" 
                  class="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span class="material-symbols-outlined text-[22px]">description</span>
                </a>
                <a 
                  data-link
                  aria-label="Active Camera" 
                  href="/camera" 
                  class="min-w-[48px] min-h-[48px] rounded-full flex items-center justify-center bg-primary text-on-primary shadow-sm active:scale-95 transition-transform"
                >
                  <span class="material-symbols-outlined text-[22px]">photo_camera</span>
                </a>
                <a 
                  data-link
                  aria-label="Gallery" 
                  href="/gallery" 
                  class="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span class="material-symbols-outlined text-[22px]">photo_library</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;
}
