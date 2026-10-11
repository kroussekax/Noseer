/**
 * Camera Screen Page Component
 * Renders live on-device viewfinder with tactile HUD overlays, shutter controls, and hardware status.
 */
export function renderCameraPage(state) {
  const { flashing, captureCount, streaming, loading, error, facingMode, lastCapturedPhoto, isInsecureContext, uploading, aiAnalyzing, aiResult, aiError } = state.camera;
  const currentRatio = state.settings.ratios[state.settings.ratioIndex] || '4:3';

  return `
    <div class="bg-surface text-on-surface font-body-md text-body-md min-h-screen flex flex-col selection:bg-surface-container-highest relative overflow-hidden select-none">
      <main class="flex-1 flex flex-col relative w-full h-full min-h-screen bg-black">
        <div class="relative w-full h-full min-h-screen flex flex-col justify-between overflow-hidden">
          
          <!-- Live On-Device Video Stream Viewfinder -->
          <video 
            id="camera-stream" 
            autoplay 
            playsinline 
            muted 
            class="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-300 ${
              facingMode === 'user' ? 'scale-x-[-1]' : ''
            } ${loading || error ? 'opacity-20' : 'opacity-100'}"
          ></video>

          <!-- Loading State Overlay -->
          ${loading ? `
            <div class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface/80 backdrop-blur-sm p-6 text-center">
              <div class="relative w-20 h-20 mb-4 flex items-center justify-center">
                <div class="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"></div>
                <div class="w-16 h-16 rounded-full border border-dashed border-primary animate-spin"></div>
                <span class="material-symbols-outlined absolute text-primary text-[28px]">photo_camera</span>
              </div>
              <span class="font-label-md text-xs tracking-[0.2em] uppercase text-primary font-bold">INITIALIZING SENSOR</span>
              <span class="font-label-sm text-[10px] text-outline tracking-wider mt-1">CONNECTING ON-DEVICE CAMERA</span>
            </div>
          ` : ''}

          <!-- Camera Error / Permission Denied Overlay -->
          ${error ? `
            <div class="absolute inset-0 z-25 flex flex-col items-center justify-center bg-surface/90 backdrop-blur-md p-6 text-center">
              <div class="w-16 h-16 rounded-2xl bg-surface-container-high border border-outline/30 flex items-center justify-center mb-4 text-outline">
                <span class="material-symbols-outlined text-[32px]">${isInsecureContext ? 'lock' : 'videocam_off'}</span>
              </div>
              <span class="font-headline-md text-sm font-bold tracking-widest text-on-surface uppercase mb-2">
                ${isInsecureContext ? 'SECURE CONTEXT REQUIRED' : 'OPTICAL SENSOR OFFLINE'}
              </span>
              <p class="font-body-md text-xs text-on-surface-variant max-w-xs mb-5 leading-relaxed">
                ${error}
              </p>
              ${!isInsecureContext ? `
                <button 
                  id="btn-retry-camera" 
                  type="button" 
                  class="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-xs font-bold tracking-wider uppercase active:scale-95 transition-transform flex items-center gap-2 shadow-lg"
                >
                  <span class="material-symbols-outlined text-[16px]">refresh</span>
                  <span>GRANT / RETRY ACCESS</span>
                </button>
              ` : `
                <div class="font-label-sm text-[10px] text-outline tracking-wider uppercase bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/30">
                  BROWSER SECURITY PROTOCOL
                </div>
              `}
            </div>
          ` : ''}

          <!-- Shutter visual flash overlay -->
          <div 
            id="shutter-flash"
            class="absolute inset-0 bg-primary pointer-events-none transition-opacity duration-150 z-30 ${
              flashing ? 'opacity-90' : 'opacity-0'
            }"
          ></div>

          <!-- Ambient Camera Vignette -->
          <div class="absolute inset-0 bg-gradient-to-b from-surface-container-lowest/80 via-transparent to-surface-container-lowest/90 pointer-events-none z-10"></div>

          <!-- Top HUD Bar: Lens switcher, live status, system links -->
          <div class="relative z-20 w-full flex items-center justify-between p-4 pt-safe">
            <!-- Camera Flip / Lens Switch Button -->
            <button 
              id="btn-flip-camera" 
              type="button"
              aria-label="Switch Camera Lens"
              class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high/80 backdrop-blur-xl border border-white/10 hover:bg-surface-container-highest active:scale-95 transition-all text-xs font-label-md text-on-surface shadow-md"
            >
              <span class="material-symbols-outlined text-[16px]">flip_camera_android</span>
              <span class="tracking-wider uppercase text-[11px]">${facingMode === 'user' ? 'FRONT' : 'REAR'}</span>
            </button>

            <!-- Center Sensor Live Indicator -->
            <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high/70 backdrop-blur-md border border-white/5 font-label-sm text-[10px] tracking-wider text-outline">
              <span class="w-2 h-2 rounded-full ${streaming ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}"></span>
              <span>${uploading ? 'UPLOADING...' : aiAnalyzing ? 'ANALYZING...' : streaming ? 'LIVE' : 'STANDBY'}</span>
            </div>

            <!-- Top Navigation Icons -->
            <div class="flex items-center gap-2">
              <a 
                data-link
                aria-label="Alerts" 
                href="/notifications" 
                class="w-8 h-8 rounded-full flex items-center justify-center bg-surface-container-high/80 backdrop-blur-xl border border-white/10 text-on-surface hover:text-primary transition-colors font-label-md text-label-md"
              >
                <span class="material-symbols-outlined text-[16px]">priority_high</span>
              </a>
              <a 
                data-link
                aria-label="Settings" 
                href="/settings" 
                class="w-8 h-8 rounded-full flex items-center justify-center bg-surface-container-high/80 backdrop-blur-xl border border-white/10 text-on-surface hover:text-primary transition-colors font-label-md text-label-md"
              >
                @
              </a>
            </div>
          </div>

          <!-- Viewfinder Frame & Optical HUD Markers -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-10 p-6">
            <div class="w-full max-w-sm aspect-[4/5] border border-dashed border-white/20 rounded-3xl relative flex flex-col justify-between p-4">
              <!-- Corner brackets -->
              <div class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-primary/60 rounded-tl-sm"></div>
              <div class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-primary/60 rounded-tr-sm"></div>
              <div class="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-primary/60 rounded-bl-sm"></div>
              <div class="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-primary/60 rounded-br-sm"></div>

              <!-- Top HUD labels -->
              <div class="flex justify-between items-center w-full">
                <span class="text-[10px] font-label-sm tracking-widest text-outline bg-surface-container-lowest/60 px-2 py-0.5 rounded backdrop-blur-sm">EV +0.0</span>
                <span class="text-[10px] font-label-sm tracking-widest text-outline bg-surface-container-lowest/60 px-2 py-0.5 rounded backdrop-blur-sm uppercase">${currentRatio}</span>
              </div>

              <!-- Center Focus Reticle -->
              <div class="self-center flex items-center justify-center w-12 h-12 border border-white/25 rounded-full relative">
                <div class="w-1.5 h-1.5 rounded-full bg-primary/70"></div>
                <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-0.5 h-2 bg-white/30"></div>
                <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-0.5 h-2 bg-white/30"></div>
                <div class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-0.5 bg-white/30"></div>
                <div class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-0.5 bg-white/30"></div>
              </div>

              <!-- Bottom HUD labels -->
              <div class="flex justify-between items-center w-full">
                <span class="text-[10px] font-label-sm tracking-widest text-outline bg-surface-container-lowest/60 px-2 py-0.5 rounded backdrop-blur-sm">ISO AUTO</span>
                <span class="text-[10px] font-label-sm tracking-widest text-outline bg-surface-container-lowest/60 px-2 py-0.5 rounded backdrop-blur-sm">${facingMode === 'user' ? 'FRONT' : 'ENV'} 48M</span>
              </div>
            </div>
          </div>

          <!-- Bottom Controls -->
          <div class="relative z-20 w-full mt-auto flex flex-col items-center gap-space-md pb-safe mb-4 px-margin">
            
            ${captureCount > 0 ? `
              <span class="font-label-sm text-[10px] text-outline uppercase tracking-widest bg-surface-container-lowest/70 backdrop-blur-md px-3 py-0.5 rounded-full border border-white/5">
                ${captureCount} ${captureCount === 1 ? 'FRAME' : 'FRAMES'} RECORDED
              </span>
            ` : ''}

            <!-- Shutter Action Bar -->
            <div class="w-full max-w-sm flex items-center justify-between px-6">
              
              <!-- Left: Last captured photo thumbnail -->
              <div class="w-14 h-14 flex items-center justify-center">
                ${lastCapturedPhoto ? `
                  <a 
                    data-link 
                    href="/gallery" 
                    aria-label="View Last Capture in Gallery" 
                    class="relative w-12 h-12 rounded-xl overflow-hidden border border-primary/50 shadow-md active:scale-95 transition-transform group"
                  >
                    <img src="${lastCapturedPhoto}" alt="Last capture thumbnail" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors"></div>
                  </a>
                ` : `
                  <div class="w-12 h-12 rounded-xl border border-dashed border-outline-variant/40 flex items-center justify-center text-outline-variant">
                    <span class="material-symbols-outlined text-[20px]">photo</span>
                  </div>
                `}
              </div>

              <!-- Center: Shutter Button -->
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

              <!-- Right: Quick Aspect Ratio Switcher -->
              <div class="w-14 h-14 flex items-center justify-center">
                <button 
                  id="btn-quick-ratio" 
                  type="button"
                  aria-label="Change Viewfinder Aspect Ratio"
                  class="w-12 h-12 rounded-xl bg-surface-container-high/80 backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center text-on-surface hover:bg-surface-container-highest active:scale-95 transition-all shadow-md"
                >
                  <span class="text-[8px] font-label-sm text-outline tracking-wider leading-none">RATIO</span>
                  <span class="text-[10px] font-label-md font-bold text-primary leading-none mt-1 uppercase">${currentRatio}</span>
                </button>
              </div>

            </div>

            <!-- AI Analysis Status -->
            ${aiAnalyzing ? `
              <div class="flex flex-col items-center gap-2 mt-3">
                <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high/80 border border-primary/20">
                  <div class="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
                  <span class="font-label-sm text-[10px] text-primary tracking-wider uppercase">AI ANALYZING...</span>
                </div>
              </div>
            ` : ''}

            ${aiError ? `
              <div class="flex flex-col items-center gap-2 mt-3">
                <button
                  id="btn-retry-ai"
                  type="button"
                  title="Retry AI analysis"
                  class="px-4 py-2 rounded-full bg-error/10 border border-error/30 flex items-center gap-1.5 active:scale-95 transition-transform"
                >
                  <span class="material-symbols-outlined text-[12px] text-error">refresh</span>
                  <span class="font-label-sm text-[10px] text-error tracking-wider">${aiError} — TAP TO RETRY</span>
                </button>
              </div>
            ` : ''}

            <!-- Global Navigation Bar Dock -->
            <div class="flex items-center justify-center gap-2 mt-1">
              <div class="bg-surface-container-high/90 backdrop-blur-xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.7)] rounded-full px-space-sm py-1.5 flex items-center gap-space-xs border border-white/5">
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

      <!-- AI Analysis Result Modal -->
      ${aiResult ? `
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
          <div class="bg-surface rounded-3xl border border-surface-container-highest/50 shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden">
            <!-- Modal Header -->
            <div class="flex items-center justify-between px-5 py-4 border-b border-surface-container-highest/30">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[20px]">auto_awesome</span>
                <span class="font-label-md text-xs font-bold tracking-wider text-on-surface uppercase">AI ANALYSIS</span>
              </div>
              <button
                id="btn-close-ai-modal"
                type="button"
                class="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span class="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <!-- Modal Body (Scrollable) -->
            <div class="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <!-- Confidence Badge -->
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 font-label-sm text-[9px] text-primary tracking-wider uppercase">
                  Confidence: ${Math.round((aiResult.analysis.confidence || 0) * 100)}%
                </span>
              </div>

              <!-- Title -->
              <div>
                <label class="font-label-sm text-[10px] text-outline tracking-wider uppercase block mb-1">Title</label>
                <input
                  id="ai-title-input"
                  type="text"
                  value="${aiResult.analysis.title || ''}"
                  class="w-full px-3 py-2 rounded-xl bg-surface-container-high border border-surface-container-highest/50 text-on-surface font-body-md text-sm focus:outline-none focus:border-primary/50"
                />
              </div>

              <!-- Notebook Selection -->
              <div>
                <label class="font-label-sm text-[10px] text-outline tracking-wider uppercase block mb-1">Notebook</label>
                <select
                  id="ai-notebook-select"
                  class="w-full px-3 py-2 rounded-xl bg-surface-container-high border border-surface-container-highest/50 text-on-surface font-body-md text-sm focus:outline-none focus:border-primary/50"
                >
                  ${aiResult.analysis.suggested_notebook_exists ? `
                    <option value="" selected>${aiResult.analysis.suggested_notebook} (suggested)</option>
                  ` : `
                    <option value="__create__" selected>${aiResult.analysis.suggested_notebook} (new)</option>
                  `}
                </select>
              </div>

              <!-- Chapter Selection -->
              <div>
                <label class="font-label-sm text-[10px] text-outline tracking-wider uppercase block mb-1">Chapter</label>
                <select
                  id="ai-chapter-select"
                  class="w-full px-3 py-2 rounded-xl bg-surface-container-high border border-surface-container-highest/50 text-on-surface font-body-md text-sm focus:outline-none focus:border-primary/50"
                >
                  ${aiResult.analysis.suggested_chapter_exists ? `
                    <option value="" selected>${aiResult.analysis.suggested_chapter} (suggested)</option>
                  ` : `
                    <option value="__create__" selected>${aiResult.analysis.suggested_chapter || 'New Chapter'} (new)</option>
                  `}
                </select>
              </div>

              <!-- Extracted Content -->
              <div>
                <label class="font-label-sm text-[10px] text-outline tracking-wider uppercase block mb-1">Content</label>
                <textarea
                  id="ai-content-input"
                  rows="6"
                  class="w-full px-3 py-2 rounded-xl bg-surface-container-high border border-surface-container-highest/50 text-on-surface font-body-md text-sm focus:outline-none focus:border-primary/50 resize-none"
                >${aiResult.analysis.extracted_text || ''}</textarea>
              </div>

              <!-- Visual Elements -->
              ${aiResult.analysis.visual_elements && aiResult.analysis.visual_elements.length > 0 ? `
                <div>
                  <label class="font-label-sm text-[10px] text-outline tracking-wider uppercase block mb-2">Visual Elements Detected</label>
                  <div class="flex flex-wrap gap-2">
                    ${aiResult.analysis.visual_elements.map(el => `
                      <span class="px-2 py-1 rounded-lg bg-surface-container border border-surface-container-highest/30 font-label-sm text-[9px] text-on-surface-variant tracking-wider uppercase">
                        ${el.type}: ${el.description.substring(0, 30)}${el.description.length > 30 ? '...' : ''}
                      </span>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>

            <!-- Modal Footer -->
            <div class="flex items-center justify-between px-5 py-4 border-t border-surface-container-highest/30">
              <button
                id="btn-discard-ai"
                type="button"
                class="px-4 py-2 rounded-full bg-surface-container-high text-outline font-label-md text-xs font-bold tracking-wider uppercase active:scale-95 transition-transform"
              >
                DISCARD
              </button>
              <button
                id="btn-confirm-ai"
                type="button"
                class="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-xs font-bold tracking-wider uppercase active:scale-95 transition-transform flex items-center gap-2 shadow-lg"
              >
                <span class="material-symbols-outlined text-[16px]">check</span>
                <span>CONFIRM & SAVE</span>
              </button>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}
