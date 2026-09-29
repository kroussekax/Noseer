import { renderHeader } from '../components/header.js';
import { renderSearchOverlay } from '../components/search-overlay.js';
import { renderNavBar } from '../components/nav-bar.js';

export function renderSettingsPage(state) {
  const { modes, modeIndex, tones, toneIndex, ratios, ratioIndex, hapticOn, privacyOn } = state.settings;

  const currentMode = modes[modeIndex];
  const currentTone = tones[toneIndex];
  const currentRatio = ratios[ratioIndex];

  return `
    <div class="min-h-screen flex flex-col bg-surface text-on-surface selection:bg-surface-container-highest">
      ${renderHeader("SETTINGS", true)}
      
      <main class="flex-1 flex flex-col relative w-full pt-24 pb-28 px-margin bg-surface">
        <div class="flex flex-col w-full max-w-md mx-auto space-y-4 select-none pt-4">
          
          <!-- Minimal Tactile Card: Display & Theme -->
          <div class="tactile-card group relative bg-surface-container rounded-2xl p-4 border border-surface-container-highest/40 shadow-sm overflow-hidden">
            <div class="flex items-center justify-between pb-3 border-b border-dashed border-outline-variant/30">
              <div class="flex items-center gap-2">
                <span class="font-label-sm text-[11px] text-outline font-semibold tracking-wider">APPEARANCE</span>
              </div>
              <span class="font-label-sm text-[10px] text-outline-variant uppercase">v2.4</span>
            </div>
            <div class="divide-y divide-surface-container-highest/50">
              <button 
                id="btn-mode"
                class="w-full py-3 flex items-center justify-between text-left group/item transition-colors" 
                type="button"
              >
                <span class="font-body-md text-sm text-on-surface">Display Mode</span>
                <div class="flex items-center gap-2">
                  <span class="font-label-md text-xs text-primary" id="mode-val">${currentMode}</span>
                  <span class="material-symbols-outlined text-[16px] text-outline-variant">chevron_right</span>
                </div>
              </button>
              <button 
                id="btn-tone"
                class="w-full py-3 flex items-center justify-between text-left group/item transition-colors" 
                type="button"
              >
                <span class="font-body-md text-sm text-on-surface">Accent Tone</span>
                <div class="flex items-center gap-2">
                  <span class="font-label-md text-xs text-on-surface-variant" id="tone-val">${currentTone}</span>
                  <span class="material-symbols-outlined text-[16px] text-outline-variant">chevron_right</span>
                </div>
              </button>
            </div>
            <div class="peel-corner absolute bottom-0 right-0 w-6 h-6 pointer-events-none">
              <div class="peel-flap absolute bottom-0 right-0 w-full h-full bg-surface-container-highest/70 rounded-tl-md shadow-[-2px_-2px_6px_rgba(0,0,0,0.5)]"></div>
            </div>
          </div>

          <!-- Minimal Tactile Card: Capture & Optics -->
          <div class="tactile-card group relative bg-surface-container rounded-2xl p-4 border border-surface-container-highest/40 shadow-sm overflow-hidden">
            <div class="flex items-center justify-between pb-3 border-b border-dashed border-outline-variant/30">
              <div class="flex items-center gap-2">
                <span class="font-label-sm text-[11px] text-outline font-semibold tracking-wider">OPTICS &amp; INPUT</span>
              </div>
              <span class="font-label-sm text-[10px] text-outline-variant uppercase">SENSOR</span>
            </div>
            <div class="divide-y divide-surface-container-highest/50">
              <button 
                id="btn-ratio"
                class="w-full py-3 flex items-center justify-between text-left group/item transition-colors" 
                type="button"
              >
                <span class="font-body-md text-sm text-on-surface">Viewfinder Ratio</span>
                <div class="flex items-center gap-2">
                  <span class="font-label-md text-xs text-on-surface-variant" id="ratio-val">${currentRatio}</span>
                  <span class="material-symbols-outlined text-[16px] text-outline-variant">chevron_right</span>
                </div>
              </button>
              <div class="w-full py-3 flex items-center justify-between">
                <span class="font-body-md text-sm text-on-surface">Tactile Haptics</span>
                <button 
                  id="haptic-toggle" 
                  class="w-9 h-5 rounded-full relative transition-colors focus:outline-none ${hapticOn ? 'bg-primary' : 'bg-surface-container-highest'}"
                  type="button"
                >
                  <span 
                    id="haptic-dot"
                    class="block w-3.5 h-3.5 rounded-full bg-surface-container-lowest transition-transform ${hapticOn ? 'translate-x-4' : 'translate-x-1'}"
                  ></span>
                </button>
              </div>
            </div>
            <div class="peel-corner absolute bottom-0 right-0 w-6 h-6 pointer-events-none">
              <div class="peel-flap absolute bottom-0 right-0 w-full h-full bg-surface-container-highest/70 rounded-tl-md shadow-[-2px_-2px_6px_rgba(0,0,0,0.5)]"></div>
            </div>
          </div>

          <!-- Minimal Tactile Card: Vault, Storage & System -->
          <div class="tactile-card group relative bg-surface-container rounded-2xl p-4 border border-surface-container-highest/40 shadow-sm overflow-hidden">
            <div class="flex items-center justify-between pb-3 border-b border-dashed border-outline-variant/30">
              <div class="flex items-center gap-2">
                <span class="font-label-sm text-[11px] text-outline font-semibold tracking-wider">SYSTEM &amp; VAULT</span>
              </div>
              <span class="font-label-sm text-[10px] text-outline-variant uppercase">SECURE</span>
            </div>
            <div class="divide-y divide-surface-container-highest/50">
              <button class="w-full py-3 flex items-center justify-between text-left group/item transition-colors" type="button">
                <span class="font-body-md text-sm text-on-surface">Cloud Vault &amp; Sync</span>
                <div class="flex items-center gap-2">
                  <span class="font-label-md text-xs text-outline">1.2 GB</span>
                  <span class="material-symbols-outlined text-[16px] text-outline-variant">chevron_right</span>
                </div>
              </button>
              <button 
                id="btn-privacy"
                class="w-full py-3 flex items-center justify-between text-left group/item transition-colors" 
                type="button"
              >
                <span class="font-body-md text-sm text-on-surface">Privacy &amp; Stripping</span>
                <div class="flex items-center gap-2">
                  <span class="font-label-md text-xs text-primary">${privacyOn ? 'ON' : 'OFF'}</span>
                  <span class="material-symbols-outlined text-[16px] text-outline-variant">chevron_right</span>
                </div>
              </button>
              <button class="w-full py-3 flex items-center justify-between text-left group/item transition-colors" type="button">
                <span class="font-body-md text-sm text-on-surface">About &amp; Licenses</span>
                <span class="material-symbols-outlined text-[16px] text-outline-variant">chevron_right</span>
              </button>
            </div>
            <div class="peel-corner absolute bottom-0 right-0 w-6 h-6 pointer-events-none">
              <div class="peel-flap absolute bottom-0 right-0 w-full h-full bg-surface-container-highest/70 rounded-tl-md shadow-[-2px_-2px_6px_rgba(0,0,0,0.5)]"></div>
            </div>
          </div>

          <!-- Subtle tactile indicator -->
          <div class="flex items-center justify-center gap-3 pt-3 opacity-40">
            <span class="h-px w-8 bg-outline-variant"></span>
            <span class="font-label-sm text-[10px] tracking-widest text-outline">ENCRYPTED LOCAL STORAGE</span>
            <span class="h-px w-8 bg-outline-variant"></span>
          </div>
        </div>

        ${renderSearchOverlay(state.searchOpen, state.searchTerm, "Search settings...")}
      </main>
      
      ${renderNavBar("settings")}
    </div>
  `;
}
