/**
 * TactileCardGrid Component
 * Renders the two interactive tactile cards: Card 1 (Lecture) and Card 2 (Metrics).
 */

export function renderTactileCardGrid(cardOneActive, cardTwoValue) {
  const formattedMetrics = `$${cardTwoValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return `
    <div class="grid grid-cols-2 gap-3.5 w-full">
      <!-- Card 1: Lecture Items -->
      <div 
        id="tactile-card-1"
        class="tactile-card group relative flex flex-col justify-between h-56 bg-surface-container rounded-2xl p-3.5 shadow-md overflow-hidden cursor-pointer border border-surface-container-highest/50 transition-transform duration-300 hover:-translate-y-1 active:scale-[0.98]"
      >
        <div class="flex items-center justify-between">
          <span class="font-label-sm text-[11px] text-outline font-semibold tracking-wider">I. LECTURE</span>
          <span class="font-label-sm text-[10px] text-outline-variant uppercase">10 Q</span>
        </div>
        <div class="my-auto flex flex-col gap-2 py-1">
          <div class="flex items-center justify-between">
            <span class="font-label-sm text-xs text-on-surface-variant font-medium">1.</span>
            <div class="h-1.5 flex-1 mx-2 rounded-full transition-all duration-300 ${cardOneActive ? 'bg-primary' : 'bg-surface-container-highest'}"></div>
            <span class="font-label-sm text-[10px] text-outline">10 Q</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-label-sm text-xs text-on-surface-variant font-medium">II.</span>
            <div class="h-1.5 flex-1 mx-2 rounded-full bg-surface-container-highest/80"></div>
            <span class="font-label-sm text-[10px] text-outline">4 R</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-label-sm text-xs text-on-surface-variant font-medium">III.</span>
            <div class="h-1.5 flex-1 mx-2 rounded-full bg-surface-container-highest/60"></div>
            <span class="font-label-sm text-[10px] text-outline">10 R</span>
          </div>
        </div>
        <div class="pt-2 border-t border-dashed border-outline-variant/40 flex items-center justify-between">
          <svg class="w-16 h-5 text-on-surface/70" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.4" viewBox="0 0 70 20">
            <path d="M 4 14 C 10 6, 14 16, 22 10 C 30 4, 32 16, 44 12 C 54 8, 60 14, 66 12"></path>
          </svg>
          <span class="w-1.5 h-1.5 rounded-full transition-colors ${cardOneActive ? 'bg-primary scale-125' : 'bg-primary'}"></span>
        </div>
        <div class="peel-corner absolute bottom-0 right-0 w-8 h-8 pointer-events-none">
          <div class="peel-flap absolute bottom-0 right-0 w-full h-full bg-surface-container-highest transition-all duration-300 group-hover:w-10 group-hover:h-10 rounded-tl-lg shadow-[-3px_-3px_8px_rgba(0,0,0,0.6)]"></div>
          <div class="peel-under absolute bottom-0 right-0 w-full h-full bg-surface-container-lowest -z-10"></div>
        </div>
      </div>

      <!-- Card 2: Metrics -->
      <div 
        id="tactile-card-2"
        class="tactile-card group relative flex flex-col justify-between h-56 bg-surface-container rounded-2xl p-3.5 shadow-md overflow-hidden cursor-pointer border border-surface-container-highest/50 transition-transform duration-300 hover:-translate-y-1 active:scale-[0.98]"
      >
        <div class="flex items-center justify-between">
          <span class="font-label-sm text-[11px] text-outline font-semibold tracking-wider">METRICS</span>
          <span class="material-symbols-outlined text-outline-variant text-[16px]">bar_chart</span>
        </div>
        <div class="my-auto flex flex-col items-center justify-center">
          <div class="w-full flex items-end justify-center gap-2 h-20 pt-2 pb-1">
            <div class="w-3 h-10 rounded-sm bg-surface-container-highest"></div>
            <div class="w-3 h-14 rounded-sm bg-primary/70 group-hover:h-16 transition-all duration-300"></div>
            <div class="w-3 h-8 rounded-sm bg-surface-container-highest"></div>
            <div class="w-3 h-16 rounded-sm bg-primary group-hover:h-18 transition-all duration-300"></div>
            <div class="w-3 h-12 rounded-sm bg-surface-container-highest"></div>
          </div>
          <div class="w-full flex items-center justify-center border-t border-dashed border-outline-variant/40 pt-1.5">
            <span class="font-label-sm text-[10px] text-outline">WEEKLY TREND</span>
          </div>
        </div>
        <div class="flex items-center justify-between pt-1">
          <span class="font-label-sm text-[11px] text-outline">${formattedMetrics}</span>
          <span class="font-label-sm text-[10px] text-outline-variant">9 bills</span>
        </div>
        <div class="peel-corner absolute bottom-0 right-0 w-8 h-8 pointer-events-none">
          <div class="peel-flap absolute bottom-0 right-0 w-full h-full bg-surface-container-highest transition-all duration-300 group-hover:w-10 group-hover:h-10 rounded-tl-lg shadow-[-3px_-3px_8px_rgba(0,0,0,0.6)]"></div>
          <div class="peel-under absolute bottom-0 right-0 w-full h-full bg-surface-container-lowest -z-10"></div>
        </div>
      </div>
    </div>
  `;
}
