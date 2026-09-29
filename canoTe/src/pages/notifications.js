export function renderNotificationsPage(state) {
  return `
    <div class="min-h-screen flex flex-col bg-surface text-on-surface selection:bg-surface-container-highest p-6">
      <header class="flex items-center justify-between pt-6 pb-4">
        <button 
          id="btn-back" 
          type="button"
          class="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-container-high transition-colors"
        >
          <span class="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <h2 class="font-headline-md text-lg tracking-widest uppercase">System Alerts</h2>
        <div class="w-10"></div>
      </header>

      <div class="flex-1 flex flex-col gap-3 mt-4 max-w-md mx-auto w-full">
        <div class="tactile-card bg-surface-container p-4 rounded-2xl border border-surface-container-highest/40 flex items-start gap-3">
          <span class="material-symbols-outlined text-primary text-[20px] mt-0.5">priority_high</span>
          <div class="flex-1">
            <div class="flex justify-between items-center mb-1">
              <h3 class="font-label-md text-xs font-bold text-on-surface">VAULT SYNCHRONIZED</h3>
              <span class="font-label-sm text-[10px] text-outline">JUST NOW</span>
            </div>
            <p class="font-body-md text-xs text-on-surface-variant">
              Encrypted local ledger #4492 has been finalized and locked to hardware key.
            </p>
          </div>
        </div>

        <div class="tactile-card bg-surface-container p-4 rounded-2xl border border-surface-container-highest/40 flex items-start gap-3">
          <span class="material-symbols-outlined text-outline-variant text-[20px] mt-0.5">info</span>
          <div class="flex-1">
            <div class="flex justify-between items-center mb-1">
              <h3 class="font-label-md text-xs font-bold text-on-surface">OPTICS CALIBRATION</h3>
              <span class="font-label-sm text-[10px] text-outline">12M AGO</span>
            </div>
            <p class="font-body-md text-xs text-on-surface-variant">
              Sensor sensitivity set to 19.5:9 aspect ratio standard.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}
