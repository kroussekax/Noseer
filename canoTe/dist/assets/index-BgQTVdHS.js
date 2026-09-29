(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))l(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&l(o)}).observe(document,{childList:!0,subtree:!0});function a(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function l(n){if(n.ep)return;n.ep=!0;const i=a(n);fetch(n.href,i)}})();const t={currentRoute:window.location.pathname||"/",previousRoute:"/",cardOneActive:!1,cardTwoValue:1420.5,searchOpen:!1,searchTerm:"",camera:{flashing:!1,captureCount:0},settings:{modes:["DARK","LIGHT","OLED"],modeIndex:0,tones:["SLATE","MONO","INK"],toneIndex:0,ratios:["19.5:9","4:3","16:9","1:1"],ratioIndex:0,hapticOn:!0,privacyOn:!0}},x=new Set;function k(e){return x.add(e),()=>x.delete(e)}function r(){x.forEach(e=>e(t))}function y(e){t.currentRoute!==e&&(t.previousRoute=t.currentRoute,t.currentRoute=e,window.history.pushState({},"",e),r())}function j(){if(window.history.length>1&&t.previousRoute){const e=t.previousRoute;t.previousRoute=t.currentRoute,t.currentRoute=e,window.history.pushState({},"",e),r()}else y("/")}function I(){t.cardOneActive=!t.cardOneActive,r()}function _(){t.cardTwoValue=Number((t.cardTwoValue+120.25).toFixed(2)),r()}function T(){t.searchOpen=!t.searchOpen,r()}function S(){t.searchOpen=!1,r()}function h(e){t.searchTerm=e,r()}function O(){t.camera.flashing=!0,t.camera.captureCount+=1,r(),setTimeout(()=>{t.camera.flashing=!1,r()},120)}function C(){t.settings.modeIndex=(t.settings.modeIndex+1)%t.settings.modes.length,r()}function L(){t.settings.toneIndex=(t.settings.toneIndex+1)%t.settings.tones.length,r()}function R(){t.settings.ratioIndex=(t.settings.ratioIndex+1)%t.settings.ratios.length,r()}function $(){t.settings.hapticOn=!t.settings.hapticOn,r()}function A(){t.settings.privacyOn=!t.settings.privacyOn,r()}function N(){window.addEventListener("popstate",()=>{t.currentRoute=window.location.pathname||"/",r()}),document.addEventListener("click",e=>{const s=e.target.closest("a[data-link]");if(s){const a=s.getAttribute("href");a&&a.startsWith("/")&&(e.preventDefault(),y(a))}})}function m(e,s=!1){return`
    <header class="fixed top-0 left-0 w-full z-40 pt-safe pointer-events-none">
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
          class="hover:text-primary transition-colors flex items-center justify-center font-label-md text-[18px] font-bold ${s?"text-primary":""}"
        >
          @
        </a>
      </div>
      <div class="w-full flex flex-col items-center justify-center pt-8 pb-3 pointer-events-auto">
        <div class="flex items-center gap-2">
          <span class="text-on-surface/60 font-label-md text-xl">·</span>
          <h1 class="font-headline-lg text-2xl tracking-[0.3em] uppercase font-bold text-on-surface">
            ${e}
          </h1>
          <span class="text-on-surface/60 font-label-md text-xl">·</span>
        </div>
        <svg class="w-28 h-3 text-on-surface/40 mt-1" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8" viewBox="0 0 100 8">
          <path d="M 2 4 Q 10 1, 18 4 T 34 4 T 50 4 T 66 4 T 82 4 T 98 4"></path>
        </svg>
      </div>
    </header>
  `}function w(e,s){const a=`$${s.toLocaleString(void 0,{minimumFractionDigits:2})}`;return`
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
            <div class="h-1.5 flex-1 mx-2 rounded-full transition-all duration-300 ${e?"bg-primary":"bg-surface-container-highest"}"></div>
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
          <span class="w-1.5 h-1.5 rounded-full transition-colors ${e?"bg-primary scale-125":"bg-primary"}"></span>
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
          <span class="font-label-sm text-[11px] text-outline">${a}</span>
          <span class="font-label-sm text-[10px] text-outline-variant">9 bills</span>
        </div>
        <div class="peel-corner absolute bottom-0 right-0 w-8 h-8 pointer-events-none">
          <div class="peel-flap absolute bottom-0 right-0 w-full h-full bg-surface-container-highest transition-all duration-300 group-hover:w-10 group-hover:h-10 rounded-tl-lg shadow-[-3px_-3px_8px_rgba(0,0,0,0.6)]"></div>
          <div class="peel-under absolute bottom-0 right-0 w-full h-full bg-surface-container-lowest -z-10"></div>
        </div>
      </div>
    </div>
  `}function v(e,s="",a="Search notes..."){return`
    <div 
      id="floating-search-bar" 
      class="fixed inset-x-4 bottom-24 z-50 transition-all duration-300 ${e?"opacity-100 pointer-events-auto translate-y-0":"opacity-0 pointer-events-none translate-y-3"}"
    >
      <div class="max-w-md mx-auto w-full bg-surface-container-high/90 backdrop-blur-xl border border-surface-container-highest/60 rounded-full h-11 px-4 flex items-center justify-between shadow-[0_12px_32px_-4px_rgba(0,0,0,0.7)] focus-within:border-primary transition-colors pointer-events-auto">
        <div class="flex items-center gap-2 flex-1">
          <span class="font-label-sm text-xs text-outline tracking-widest">······</span>
          <input 
            id="search-input" 
            value="${s}"
            class="bg-transparent text-sm text-on-surface placeholder:text-outline-variant focus:outline-none w-full font-body-md" 
            placeholder="${a}" 
            type="text" 
          />
        </div>
        <button 
          id="close-search-btn" 
          type="button" 
          class="text-on-surface-variant hover:text-on-surface flex items-center justify-center p-1 focus:outline-none"
        >
          <span class="material-symbols-outlined text-[20px]">${s?"close":"search"}</span>
        </button>
      </div>
    </div>
  `}function b(e){return`
    <nav class="fixed bottom-0 w-full z-50 pb-safe pointer-events-none flex justify-center">
      <div class="pointer-events-auto mb-6 mx-auto flex items-center gap-2">
        <div class="bg-surface-container-high/90 backdrop-blur-xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.7)] rounded-full px-space-sm py-1.5 flex items-center gap-space-xs">
          <a 
            data-link
            aria-label="Notes" 
            href="/" 
            class="rounded-full flex items-center justify-center transition-all active:scale-95 ${e==="notes"?"min-w-[48px] min-h-[48px] bg-primary text-on-primary shadow-sm":"min-w-[44px] min-h-[44px] text-on-surface-variant hover:text-on-surface"}"
          >
            <span class="material-symbols-outlined text-[22px]">description</span>
          </a>
          
          <a 
            data-link
            aria-label="Active Camera" 
            href="/camera" 
            class="rounded-full flex items-center justify-center transition-all active:scale-95 ${e==="camera"?"min-w-[48px] min-h-[48px] bg-primary text-on-primary shadow-sm":"min-w-[44px] min-h-[44px] text-on-surface-variant hover:text-on-surface"}"
          >
            <span class="material-symbols-outlined text-[22px]">photo_camera</span>
          </a>
          
          <a 
            data-link
            aria-label="Gallery" 
            href="/gallery" 
            class="rounded-full flex items-center justify-center transition-all active:scale-95 ${e==="gallery"?"min-w-[48px] min-h-[48px] bg-primary text-on-primary shadow-sm":"min-w-[44px] min-h-[44px] text-on-surface-variant hover:text-on-surface"}"
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
  `}function B(e){return`
    <div class="min-h-screen flex flex-col bg-surface text-on-surface selection:bg-surface-container-highest">
      ${m("NOTES")}
      <main class="flex-1 flex flex-col relative w-full pt-14 pb-28 px-margin bg-surface">
        <div class="flex flex-col w-full h-full min-h-[calc(100vh-140px)] justify-between select-none pt-16 pb-24 px-margin">
          <div class="flex flex-col gap-4 w-full">
            ${w(e.cardOneActive,e.cardTwoValue)}
          </div>
        </div>
        ${v(e.searchOpen,e.searchTerm,"Search notes...")}
      </main>
      ${b("notes")}
    </div>
  `}function M(e){const{flashing:s,captureCount:a}=e.camera;return`
    <div class="bg-surface text-on-surface font-body-md text-body-md min-h-screen flex flex-col selection:bg-surface-container-highest relative">
      <main class="flex-1 flex flex-col relative w-full bg-surface">
        <div class="relative w-full h-full min-h-screen flex flex-col justify-between overflow-hidden bg-surface select-none">
          
          <!-- Shutter visual flash overlay -->
          <div 
            id="shutter-flash"
            class="absolute inset-0 bg-primary pointer-events-none transition-opacity duration-150 z-30 ${s?"opacity-90":"opacity-0"}"
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
              ${a>0?`
                <span class="font-label-sm text-[10px] text-outline uppercase tracking-wider">
                  ${a} captured
                </span>
              `:""}
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
  `}function P(e){return`
    <div class="min-h-screen flex flex-col bg-surface text-on-surface selection:bg-surface-container-highest">
      ${m("Gallery")}
      <main class="flex-1 flex flex-col relative w-full pt-14 pb-28 px-margin bg-surface">
        <div class="flex flex-col w-full h-full min-h-[calc(100vh-140px)] justify-between select-none pt-16 pb-24 px-margin">
          <div class="flex flex-col gap-4 w-full">
            ${w(e.cardOneActive,e.cardTwoValue)}
          </div>
        </div>
        ${v(e.searchOpen,e.searchTerm,"Search gallery & assets...")}
      </main>
      ${b("gallery")}
    </div>
  `}function V(e){const{modes:s,modeIndex:a,tones:l,toneIndex:n,ratios:i,ratioIndex:o,hapticOn:c,privacyOn:d}=e.settings,u=s[a],f=l[n],p=i[o];return`
    <div class="min-h-screen flex flex-col bg-surface text-on-surface selection:bg-surface-container-highest">
      ${m("SETTINGS",!0)}
      
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
                  <span class="font-label-md text-xs text-primary" id="mode-val">${u}</span>
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
                  <span class="font-label-md text-xs text-on-surface-variant" id="tone-val">${f}</span>
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
                  <span class="font-label-md text-xs text-on-surface-variant" id="ratio-val">${p}</span>
                  <span class="material-symbols-outlined text-[16px] text-outline-variant">chevron_right</span>
                </div>
              </button>
              <div class="w-full py-3 flex items-center justify-between">
                <span class="font-body-md text-sm text-on-surface">Tactile Haptics</span>
                <button 
                  id="haptic-toggle" 
                  class="w-9 h-5 rounded-full relative transition-colors focus:outline-none ${c?"bg-primary":"bg-surface-container-highest"}"
                  type="button"
                >
                  <span 
                    id="haptic-dot"
                    class="block w-3.5 h-3.5 rounded-full bg-surface-container-lowest transition-transform ${c?"translate-x-4":"translate-x-1"}"
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
                  <span class="font-label-md text-xs text-primary">${d?"ON":"OFF"}</span>
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

        ${v(e.searchOpen,e.searchTerm,"Search settings...")}
      </main>
      
      ${b("settings")}
    </div>
  `}function G(e){return`
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
  `}function g(e){const s=t.currentRoute;let a="";s==="/camera"?a=M(t):s==="/gallery"?a=P(t):s==="/settings"?a=V(t):s==="/notifications"?a=G():a=B(t);const l=document.getElementById("search-input"),n=document.activeElement===l,i=l?l.selectionStart:null;if(e.innerHTML=a,n){const o=document.getElementById("search-input");o&&(o.focus(),i!==null&&o.setSelectionRange(i,i))}D()}function D(){const e=document.getElementById("tactile-card-1");e&&e.addEventListener("click",()=>I());const s=document.getElementById("tactile-card-2");s&&s.addEventListener("click",()=>_());const a=document.getElementById("nav-search-btn");a&&a.addEventListener("click",()=>T());const l=document.getElementById("close-search-btn");l&&l.addEventListener("click",()=>{t.searchTerm?h(""):S()});const n=document.getElementById("search-input");n&&n.addEventListener("input",E=>{h(E.target.value)});const i=document.getElementById("shutter-trigger");i&&i.addEventListener("click",()=>O());const o=document.getElementById("btn-mode");o&&o.addEventListener("click",()=>C());const c=document.getElementById("btn-tone");c&&c.addEventListener("click",()=>L());const d=document.getElementById("btn-ratio");d&&d.addEventListener("click",()=>R());const u=document.getElementById("haptic-toggle");u&&u.addEventListener("click",()=>$());const f=document.getElementById("btn-privacy");f&&f.addEventListener("click",()=>A());const p=document.getElementById("btn-back");p&&p.addEventListener("click",()=>j())}document.addEventListener("DOMContentLoaded",()=>{const e=document.getElementById("app");N(),k(()=>{g(e)}),g(e)});
