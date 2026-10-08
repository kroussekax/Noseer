/**
 * Login / Register Page Component
 * Preserves the exact Stitch visual design language:
 * - Tactile card styling with dashed dividers
 * - Space Grotesk headline + JetBrains Mono labels
 * - Tab switching between Sign In & Create Account
 */

export function renderLoginPage(state, isRegistering = false, errorMessage = '') {
  return `
    <div class="min-h-screen flex flex-col bg-surface text-on-surface selection:bg-surface-container-highest">
      <!-- Header -->
      <header class="fixed top-0 left-0 w-full z-40 pt-safe pointer-events-none">
        <div class="w-full flex flex-col items-center justify-center pt-8 pb-3 pointer-events-auto">
          <div class="flex items-center gap-2">
            <span class="text-on-surface/60 font-label-md text-xl">·</span>
            <h1 class="font-headline-lg text-2xl tracking-[0.3em] uppercase font-bold text-on-surface">
              VAULT
            </h1>
            <span class="text-on-surface/60 font-label-md text-xl">·</span>
          </div>
          <svg class="w-28 h-3 text-on-surface/40 mt-1" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8" viewBox="0 0 100 8">
            <path d="M 2 4 Q 10 1, 18 4 T 34 4 T 50 4 T 66 4 T 82 4 T 98 4"></path>
          </svg>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col items-center justify-center px-margin pt-20 pb-16">
        <div class="w-full max-w-sm flex flex-col space-y-4">
          
          <!-- Mode Selector Tabs -->
          <div class="flex items-center justify-center gap-1 p-1 bg-surface-container rounded-full border border-surface-container-highest/40">
            <button 
              id="tab-login"
              type="button"
              class="flex-1 py-1.5 rounded-full text-xs font-label-md font-medium transition-all ${!isRegistering ? 'bg-primary text-on-primary shadow-sm' : 'text-outline hover:text-on-surface'}"
            >
              LOG IN
            </button>
            <button 
              id="tab-register"
              type="button"
              class="flex-1 py-1.5 rounded-full text-xs font-label-md font-medium transition-all ${isRegistering ? 'bg-primary text-on-primary shadow-sm' : 'text-outline hover:text-on-surface'}"
            >
              REGISTER
            </button>
          </div>

          <!-- Auth Form Card -->
          <div class="tactile-card relative bg-surface-container rounded-2xl p-5 border border-surface-container-highest/40 shadow-sm overflow-hidden">
            <div class="flex items-center justify-between pb-3 border-b border-dashed border-outline-variant/30">
              <span class="font-label-sm text-[11px] text-outline font-semibold tracking-wider">
                ${isRegistering ? 'NEW IDENTITY' : 'AUTHENTICATION'}
              </span>
              <span class="font-label-sm text-[10px] text-outline-variant uppercase">SECURE</span>
            </div>

            ${errorMessage ? `
              <div id="auth-error" class="mt-3 p-2.5 rounded-lg bg-error-container/30 border border-error/20 flex items-center gap-2">
                <span class="material-symbols-outlined text-error text-[18px]">error</span>
                <span class="font-body-md text-xs text-error">${errorMessage}</span>
              </div>
            ` : ''}

            <form id="auth-form" class="mt-4 space-y-4">
              <div>
                <label for="auth-email" class="block font-label-sm text-[10px] text-outline uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input 
                  type="email" 
                  id="auth-email" 
                  name="email" 
                  required 
                  autocomplete="email"
                  placeholder="user@example.com"
                  class="w-full bg-surface-container-highest/60 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 font-body-md text-sm text-on-surface placeholder:text-outline-variant/50 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label for="auth-password" class="block font-label-sm text-[10px] text-outline uppercase tracking-wider mb-1">
                  Password
                </label>
                <input 
                  type="password" 
                  id="auth-password" 
                  name="password" 
                  required 
                  autocomplete="${isRegistering ? 'new-password' : 'current-password'}"
                  placeholder="••••••••"
                  class="w-full bg-surface-container-highest/60 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 font-body-md text-sm text-on-surface placeholder:text-outline-variant/50 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div class="pt-2">
                <button 
                  id="btn-auth-submit"
                  type="submit"
                  class="w-full py-3 bg-primary text-on-primary rounded-xl font-label-md text-xs font-bold tracking-wider uppercase transition-transform active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
                >
                  <span id="btn-auth-text">${isRegistering ? 'CREATE VAULT' : 'ACCESS VAULT'}</span>
                  <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </form>

            <div class="mt-4 pt-3 border-t border-dashed border-outline-variant/30 flex items-center justify-between text-outline-variant">
              <span class="font-label-sm text-[10px]">ENCRYPTION</span>
              <span class="font-label-sm text-[10px]">BCRYPT / COOKIE</span>
            </div>
          </div>

        </div>
      </main>
    </div>
  `;
}
