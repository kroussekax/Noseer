/**
 * Header Component
 * Displays top navigation icons (Alerts, Settings, User status) and title decoration.
 */
import { state } from '../state.js';

export function renderHeader(title, showSettingsActive = false) {
  const user = state?.user;

  return `
    <header class="fixed top-0 left-0 w-full z-40 pt-safe pointer-events-none">
      ${user ? `
        <div class="absolute top-2 left-4 pointer-events-auto flex items-center gap-2 text-outline font-label-sm text-[10px]">
          <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          <span class="max-w-[110px] truncate uppercase font-semibold text-on-surface-variant">${user.email.split('@')[0]}</span>
          <button 
            id="btn-logout" 
            title="Log out" 
            type="button"
            class="hover:text-error transition-colors p-0.5 text-outline-variant hover:text-error"
          >
            <span class="material-symbols-outlined text-[15px]">logout</span>
          </button>
        </div>
      ` : ''}

      <div class="absolute top-2 right-4 pointer-events-auto flex items-center gap-3 text-on-surface/80">
        <a 
          data-link
          aria-label="Alerts" 
          href="/notifications" 
          class="hover:text-primary transition-colors flex items-center justify-center font-label-md text-[18px] font-bold"
        >
          <span class="material-symbols-outlined text-[20px]">priority_high</span>
        </a>
        <a 
          data-link
          aria-label="Settings" 
          href="/settings" 
          class="hover:text-primary transition-colors flex items-center justify-center font-label-md text-[18px] font-bold ${showSettingsActive ? 'text-primary' : ''}"
        >
          @
        </a>
      </div>
      <div class="w-full flex flex-col items-center justify-center pt-8 pb-3 pointer-events-auto">
        <div class="flex items-center gap-2">
          <span class="text-on-surface/60 font-label-md text-xl">·</span>
          <h1 class="font-headline-lg text-2xl tracking-[0.3em] uppercase font-bold text-on-surface">
            ${title}
          </h1>
          <span class="text-on-surface/60 font-label-md text-xl">·</span>
        </div>
        <svg class="w-28 h-3 text-on-surface/40 mt-1" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8" viewBox="0 0 100 8">
          <path d="M 2 4 Q 10 1, 18 4 T 34 4 T 50 4 T 66 4 T 82 4 T 98 4"></path>
        </svg>
      </div>
    </header>
  `;
}
