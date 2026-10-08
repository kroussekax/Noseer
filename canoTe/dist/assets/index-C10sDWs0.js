(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const u of o.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&n(u)}).observe(document,{childList:!0,subtree:!0});function r(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(s){if(s.ep)return;s.ep=!0;const o=r(s);fetch(s.href,o)}})();const ue="tactile_prefs",be={modeIndex:0,toneIndex:0,ratioIndex:0,hapticOn:!0,privacyOn:!0},se=[{name:"SLATE",primary:"#ffffff",onPrimary:"#2f3132",indicator:"#94a3b8"},{name:"MONO",primary:"#c6c6c7",onPrimary:"#1a1c1d",indicator:"#71717a"},{name:"INK",primary:"#e2e2e3",onPrimary:"#0f172a",indicator:"#38bdf8"}];function xe(){let t={};try{const r=localStorage.getItem(ue);r&&(t=JSON.parse(r))}catch{}const a={...be,...t};return e&&e.settings&&(e.settings.modeIndex=a.modeIndex??0,e.settings.toneIndex=a.toneIndex??0,e.settings.ratioIndex=a.ratioIndex??0,e.settings.hapticOn=a.hapticOn??!0,e.settings.privacyOn=a.privacyOn??!0),pe(a),a}function he(t){try{localStorage.setItem(ue,JSON.stringify(t))}catch{}}function pe(t){const a=document.documentElement,r=e.settings.modes[t.modeIndex]||"DARK";a.classList.remove("dark","light","oled"),r==="LIGHT"?(a.classList.add("light"),document.body.style.backgroundColor="#f4f4f5"):r==="OLED"?(a.classList.add("dark","oled"),document.body.style.backgroundColor="#000000"):(a.classList.add("dark"),document.body.style.backgroundColor="#131315");const n=se[t.toneIndex]||se[0];a.style.setProperty("--accent-primary",n.primary),a.style.setProperty("--accent-on-primary",n.onPrimary),a.style.setProperty("--accent-indicator",n.indicator)}function P(t,a){if(!e.settings)return;e.settings[t]=a;const r={modeIndex:e.settings.modeIndex,toneIndex:e.settings.toneIndex,ratioIndex:e.settings.ratioIndex,hapticOn:e.settings.hapticOn,privacyOn:e.settings.privacyOn};he(r),pe(r),d()}const e={currentRoute:window.location.pathname||"/",previousRoute:"/",user:null,authLoading:!0,notebooks:[],currentNotebook:null,currentChapter:null,currentPage:null,notebooksLoading:!1,saveStatus:"saved",cardOneActive:!1,cardTwoValue:1420.5,searchOpen:!1,searchTerm:"",camera:{flashing:!1,captureCount:0,streaming:!1,loading:!1,error:null,facingMode:"environment",lastCapturedPhoto:null,capturedPhotos:[],uploading:!1},settings:{modes:["DARK","LIGHT","OLED"],modeIndex:0,tones:["SLATE","MONO","INK"],toneIndex:0,ratios:["19.5:9","4:3","16:9","1:1"],ratioIndex:0,hapticOn:!0,privacyOn:!0}},B=new Set;function ge(t){return B.add(t),()=>B.delete(t)}function d(){B.forEach(t=>t(e))}function w(t){e.currentRoute!==t&&(e.previousRoute=e.currentRoute,e.currentRoute=t,window.history.pushState({},"",t),d())}function ve(){var t,a,r;if(window.history.length>1&&e.previousRoute&&e.previousRoute!==e.currentRoute){const n=e.previousRoute;e.previousRoute=e.currentRoute,e.currentRoute=n,window.history.pushState({},"",n),d()}else e.currentPage?w(`/notebooks/${((t=e.currentNotebook)==null?void 0:t.id)||""}/chapters/${((a=e.currentChapter)==null?void 0:a.id)||""}`):e.currentChapter?w(`/notebooks/${((r=e.currentNotebook)==null?void 0:r.id)||""}`):w("/")}function ye(){e.searchOpen=!e.searchOpen,d()}function we(){e.searchOpen=!1,d()}function oe(t){e.searchTerm=t,d()}function Ee(t){e.camera.capturedPhotos=e.camera.capturedPhotos.filter(a=>a.id!==t),e.camera.lastCapturedPhoto&&!e.camera.capturedPhotos.some(a=>a.url===e.camera.lastCapturedPhoto)&&(e.camera.lastCapturedPhoto=e.camera.capturedPhotos.length>0?e.camera.capturedPhotos[0].url:null),d()}function ke(){e.camera.capturedPhotos=[],e.camera.lastCapturedPhoto=null,d()}function Te(){const t=(e.settings.modeIndex+1)%e.settings.modes.length;P("modeIndex",t)}function Ce(){const t=(e.settings.toneIndex+1)%e.settings.tones.length;P("toneIndex",t)}function ie(){const t=(e.settings.ratioIndex+1)%e.settings.ratios.length;P("ratioIndex",t)}function Ie(){P("hapticOn",!e.settings.hapticOn)}function Se(){P("privacyOn",!e.settings.privacyOn)}function Pe(){window.addEventListener("popstate",()=>{e.currentRoute=window.location.pathname||"/",d()}),document.addEventListener("click",t=>{const a=t.target.closest("a[data-link]");if(a){const r=a.getAttribute("href");r&&r.startsWith("/")&&(t.preventDefault(),w(r))}})}const M="".replace(/\/$/,"");async function O(t,a,r=null){const n={method:t,credentials:"include",headers:{}};r!==null&&(n.headers["Content-Type"]="application/json",n.body=JSON.stringify(r));let s;try{s=await fetch(`${M}/api${a}`,n)}catch{const u=new Error("Network error — check your connection");throw u.type="network",u}if(s.status===401){window.dispatchEvent(new Event("auth:expired"));const o=new Error("Not authenticated");throw o.status=401,o}if(!s.ok){const o=await s.json().catch(()=>({detail:s.statusText})),u=new Error(o.detail||"Request failed");throw u.status=s.status,u}return s.status===204?null:s.json()}const x={get:t=>O("GET",t),post:(t,a)=>O("POST",t,a),patch:(t,a)=>O("PATCH",t,a),delete:t=>O("DELETE",t)},$e=()=>x.get("/auth/me"),Ae=(t,a)=>x.post("/auth/login",{email:t,password:a}),Ne=(t,a)=>x.post("/auth/register",{email:t,password:a}),Oe=()=>x.post("/auth/logout"),fe=()=>x.get("/notebooks"),Le=t=>x.post("/notebooks",t),je=t=>x.get(`/notebooks/${t}`),Re=t=>x.delete(`/notebooks/${t}`),_e=(t,a)=>x.post(`/notebooks/${t}/chapters`,a),Be=t=>x.delete(`/chapters/${t}`),De=t=>x.get(`/chapters/${t}/pages`),Me=(t,a)=>x.post(`/chapters/${t}/pages`,a),Fe=t=>x.get(`/pages/${t}`),Ve=(t,a)=>x.patch(`/pages/${t}`,a),Ue=t=>x.delete(`/pages/${t}`),le=t=>x.delete(`/uploads/${t}`);async function He(t,a){const r=new FormData;r.append("file",a,"capture.jpg");let n;try{n=await fetch(`${M}/api/pages/${t}/uploads`,{method:"POST",credentials:"include",body:r})}catch{throw new Error("Network error during upload")}if(n.status===401)throw window.dispatchEvent(new Event("auth:expired")),new Error("Not authenticated");if(!n.ok){const s=await n.json().catch(()=>({detail:n.statusText}));throw new Error(s.detail||"Upload failed")}return n.json()}const Ge=()=>x.get("/uploads");function qe(t,a=!1,r=""){return`
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
              class="flex-1 py-1.5 rounded-full text-xs font-label-md font-medium transition-all ${a?"text-outline hover:text-on-surface":"bg-primary text-on-primary shadow-sm"}"
            >
              LOG IN
            </button>
            <button 
              id="tab-register"
              type="button"
              class="flex-1 py-1.5 rounded-full text-xs font-label-md font-medium transition-all ${a?"bg-primary text-on-primary shadow-sm":"text-outline hover:text-on-surface"}"
            >
              REGISTER
            </button>
          </div>

          <!-- Auth Form Card -->
          <div class="tactile-card relative bg-surface-container rounded-2xl p-5 border border-surface-container-highest/40 shadow-sm overflow-hidden">
            <div class="flex items-center justify-between pb-3 border-b border-dashed border-outline-variant/30">
              <span class="font-label-sm text-[11px] text-outline font-semibold tracking-wider">
                ${a?"NEW IDENTITY":"AUTHENTICATION"}
              </span>
              <span class="font-label-sm text-[10px] text-outline-variant uppercase">SECURE</span>
            </div>

            ${r?`
              <div id="auth-error" class="mt-3 p-2.5 rounded-lg bg-error-container/30 border border-error/20 flex items-center gap-2">
                <span class="material-symbols-outlined text-error text-[18px]">error</span>
                <span class="font-body-md text-xs text-error">${r}</span>
              </div>
            `:""}

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
                  autocomplete="${a?"new-password":"current-password"}"
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
                  <span id="btn-auth-text">${a?"CREATE VAULT":"ACCESS VAULT"}</span>
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
  `}function $(t,a=!1){const r=e==null?void 0:e.user;return`
    <header class="fixed top-0 left-0 w-full z-40 pt-safe pointer-events-none">
      ${r?`
        <div class="absolute top-2 left-4 pointer-events-auto flex items-center gap-2 text-outline font-label-sm text-[10px]">
          <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          <span class="max-w-[110px] truncate uppercase font-semibold text-on-surface-variant">${r.email.split("@")[0]}</span>
          <button 
            id="btn-logout" 
            title="Log out" 
            type="button"
            class="hover:text-error transition-colors p-0.5 text-outline-variant hover:text-error"
          >
            <span class="material-symbols-outlined text-[15px]">logout</span>
          </button>
        </div>
      `:""}

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
          class="hover:text-primary transition-colors flex items-center justify-center font-label-md text-[18px] font-bold ${a?"text-primary":""}"
        >
          @
        </a>
      </div>
      <div class="w-full flex flex-col items-center justify-center pt-8 pb-3 pointer-events-auto">
        <div class="flex items-center gap-2">
          <span class="text-on-surface/60 font-label-md text-xl">·</span>
          <h1 class="font-headline-lg text-2xl tracking-[0.3em] uppercase font-bold text-on-surface">
            ${t}
          </h1>
          <span class="text-on-surface/60 font-label-md text-xl">·</span>
        </div>
        <svg class="w-28 h-3 text-on-surface/40 mt-1" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8" viewBox="0 0 100 8">
          <path d="M 2 4 Q 10 1, 18 4 T 34 4 T 50 4 T 66 4 T 82 4 T 98 4"></path>
        </svg>
      </div>
    </header>
  `}function A(t,a="",r="Search notes..."){return`
    <div 
      id="floating-search-bar" 
      class="fixed inset-x-4 bottom-24 z-50 transition-all duration-300 ${t?"opacity-100 pointer-events-auto translate-y-0":"opacity-0 pointer-events-none translate-y-3"}"
    >
      <div class="max-w-md mx-auto w-full bg-surface-container-high/90 backdrop-blur-xl border border-surface-container-highest/60 rounded-full h-11 px-4 flex items-center justify-between shadow-[0_12px_32px_-4px_rgba(0,0,0,0.7)] focus-within:border-primary transition-colors pointer-events-auto">
        <div class="flex items-center gap-2 flex-1">
          <span class="font-label-sm text-xs text-outline tracking-widest">······</span>
          <input 
            id="search-input" 
            value="${a}"
            class="bg-transparent text-sm text-on-surface placeholder:text-outline-variant focus:outline-none w-full font-body-md" 
            placeholder="${r}" 
            type="text" 
          />
        </div>
        <button 
          id="close-search-btn" 
          type="button" 
          class="text-on-surface-variant hover:text-on-surface flex items-center justify-center p-1 focus:outline-none"
        >
          <span class="material-symbols-outlined text-[20px]">${a?"close":"search"}</span>
        </button>
      </div>
    </div>
  `}function N(t){return`
    <nav class="fixed bottom-0 w-full z-50 pb-safe pointer-events-none flex justify-center">
      <div class="pointer-events-auto mb-6 mx-auto flex items-center gap-2">
        <div class="bg-surface-container-high/90 backdrop-blur-xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.7)] rounded-full px-space-sm py-1.5 flex items-center gap-space-xs">
          <a 
            data-link
            aria-label="Notes" 
            href="/" 
            class="rounded-full flex items-center justify-center transition-all active:scale-95 ${t==="notes"?"min-w-[48px] min-h-[48px] bg-primary text-on-primary shadow-sm":"min-w-[44px] min-h-[44px] text-on-surface-variant hover:text-on-surface"}"
          >
            <span class="material-symbols-outlined text-[22px]">description</span>
          </a>
          
          <a 
            data-link
            aria-label="Active Camera" 
            href="/camera" 
            class="rounded-full flex items-center justify-center transition-all active:scale-95 ${t==="camera"?"min-w-[48px] min-h-[48px] bg-primary text-on-primary shadow-sm":"min-w-[44px] min-h-[44px] text-on-surface-variant hover:text-on-surface"}"
          >
            <span class="material-symbols-outlined text-[22px]">photo_camera</span>
          </a>
          
          <a 
            data-link
            aria-label="Gallery" 
            href="/gallery" 
            class="rounded-full flex items-center justify-center transition-all active:scale-95 ${t==="gallery"?"min-w-[48px] min-h-[48px] bg-primary text-on-primary shadow-sm":"min-w-[44px] min-h-[44px] text-on-surface-variant hover:text-on-surface"}"
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
  `}function ze(t){const a=t.notebooks||[],r=(t.searchTerm||"").trim().toLowerCase(),n=r?a.filter(s=>(s.name||"").toLowerCase().includes(r)||(s.description||"").toLowerCase().includes(r)):a;return`
    <div class="min-h-screen flex flex-col bg-surface text-on-surface selection:bg-surface-container-highest">
      ${$("NOTES")}

      <main class="flex-1 flex flex-col relative w-full pt-20 pb-28 px-margin bg-surface">
        <div class="flex flex-col w-full max-w-lg mx-auto space-y-4 pt-4 select-none">

          <!-- Notebook Creator Trigger / Card -->
          <div class="flex items-center justify-between px-1">
            <span class="font-label-sm text-[11px] text-outline tracking-wider uppercase font-semibold">
              NOTEBOOKS (${a.length})
            </span>
            <button
              id="btn-show-create-notebook"
              type="button"
              class="flex items-center gap-1.5 px-3 py-1 bg-surface-container rounded-full border border-surface-container-highest/60 text-xs font-label-md text-primary hover:border-primary/50 transition-colors"
            >
              <span class="material-symbols-outlined text-[16px]">add</span>
              <span>NEW NOTEBOOK</span>
            </button>
          </div>

          <!-- Create Notebook Input Panel (hidden by default unless active) -->
          <div id="create-notebook-panel" class="hidden tactile-card bg-surface-container rounded-2xl p-4 border border-primary/30 shadow-md">
            <div class="flex items-center justify-between pb-2 border-b border-dashed border-outline-variant/30 mb-3">
              <span class="font-label-sm text-[10px] text-primary uppercase font-bold tracking-wider">CREATE NOTEBOOK</span>
              <button id="btn-cancel-create-notebook" type="button" class="text-outline hover:text-on-surface">
                <span class="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form id="form-create-notebook" class="space-y-3">
              <input
                id="input-notebook-name"
                type="text"
                placeholder="Notebook Title..."
                required
                class="w-full bg-surface-container-highest/60 border border-outline-variant/30 rounded-xl px-3 py-2 font-body-md text-sm text-on-surface placeholder:text-outline-variant/50 focus:outline-none focus:border-primary"
              />
              <input
                id="input-notebook-desc"
                type="text"
                placeholder="Optional description..."
                class="w-full bg-surface-container-highest/60 border border-outline-variant/30 rounded-xl px-3 py-2 font-body-md text-xs text-on-surface placeholder:text-outline-variant/50 focus:outline-none focus:border-primary"
              />
              <div class="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  class="px-4 py-2 bg-primary text-on-primary rounded-xl font-label-md text-xs font-bold uppercase transition-transform active:scale-[0.98]"
                >
                  SAVE NOTEBOOK
                </button>
              </div>
            </form>
          </div>

          <!-- Notebooks Grid / List -->
          ${t.notebooksLoading?`
            <div class="flex flex-col items-center justify-center py-16 text-outline">
              <span class="material-symbols-outlined animate-spin text-[32px]">progress_activity</span>
              <span class="font-label-md text-xs mt-3 tracking-widest uppercase">LOADING NOTEBOOKS...</span>
            </div>
          `:n.length===0?`
            <div class="tactile-card bg-surface-container/50 border border-dashed border-outline-variant/40 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3">
              <span class="material-symbols-outlined text-[36px] text-outline-variant">menu_book</span>
              <span class="font-label-md text-xs text-outline tracking-wider uppercase">
                ${r?"NO NOTEBOOKS MATCHING QUERY":"NO NOTEBOOKS IN VAULT"}
              </span>
              <p class="font-body-md text-xs text-outline-variant max-w-xs">
                ${r?"Try a different search term or clear the filter.":"Organize your field research, optical captures, and thoughts into structured notebooks."}
              </p>
            </div>
          `:`
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
              ${n.map((s,o)=>{const u=s.updated_at||s.created_at?new Date(s.updated_at||s.created_at).toLocaleDateString([],{month:"short",day:"numeric"}):"RECENT";return`
                  <div
                    data-notebook-card="${s.id}"
                    class="tactile-card group relative flex flex-col justify-between min-h-[160px] bg-surface-container rounded-2xl p-4 shadow-md overflow-hidden cursor-pointer border border-surface-container-highest/50 transition-all duration-300 hover:-translate-y-1 hover:border-outline-variant/60 active:scale-[0.98]"
                  >
                    <div class="flex items-center justify-between">
                      <span class="font-label-sm text-[11px] text-outline font-semibold tracking-wider uppercase">
                        ${Ke(o+1)}. NOTEBOOK
                      </span>
                      <span class="font-label-sm text-[10px] text-outline-variant uppercase">${u}</span>
                    </div>

                    <div class="my-3 flex flex-col gap-1">
                      <h2 class="font-headline-md text-base font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                        ${ce(s.name)}
                      </h2>
                      <p class="font-body-md text-xs text-on-surface-variant line-clamp-2">
                        ${s.description?ce(s.description):"No description provided."}
                      </p>
                    </div>

                    <div class="pt-2 border-t border-dashed border-outline-variant/30 flex items-center justify-between text-outline-variant">
                      <div class="flex items-center gap-1.5 text-xs font-label-sm text-outline">
                        <span class="material-symbols-outlined text-[14px]">folder_open</span>
                        <span>VIEW CHAPTERS</span>
                      </div>
                      <button
                        type="button"
                        data-delete-notebook="${s.id}"
                        aria-label="Delete Notebook"
                        class="p-1 hover:text-error transition-colors"
                      >
                        <span class="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                `}).join("")}
            </div>
          `}

        </div>
        ${A(t.searchOpen,t.searchTerm,"Search notebooks...")}
      </main>
      ${N("notes")}
    </div>
  `}function Ke(t){return["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"][t-1]||`${t}`}function ce(t){return t?t.replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a]):""}function Ye(t){const a=t.currentNotebook||{name:"NOTEBOOK",chapters:[]},r=a.chapters||[];return`
    <div class="min-h-screen flex flex-col bg-surface text-on-surface selection:bg-surface-container-highest">
      ${$("CHAPTERS")}

      <main class="flex-1 flex flex-col relative w-full pt-20 pb-28 px-margin bg-surface">
        <div class="flex flex-col w-full max-w-lg mx-auto space-y-4 pt-4 select-none">

          <!-- Breadcrumb & Back -->
          <div class="flex items-center justify-between px-1">
            <button
              id="btn-back-to-notebooks"
              type="button"
              class="flex items-center gap-1 text-xs font-label-md text-outline hover:text-on-surface transition-colors"
            >
              <span class="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>ALL NOTEBOOKS</span>
            </button>
            <button
              id="btn-show-create-chapter"
              type="button"
              class="flex items-center gap-1 px-3 py-1 bg-surface-container rounded-full border border-surface-container-highest/60 text-xs font-label-md text-primary hover:border-primary/50 transition-colors"
            >
              <span class="material-symbols-outlined text-[16px]">add</span>
              <span>NEW CHAPTER</span>
            </button>
          </div>

          <!-- Notebook Overview Banner -->
          <div class="tactile-card bg-surface-container rounded-2xl p-4 border border-surface-container-highest/50">
            <div class="flex items-center justify-between pb-2 border-b border-dashed border-outline-variant/30">
              <span class="font-label-sm text-[10px] text-primary uppercase font-bold tracking-wider">CURRENT NOTEBOOK</span>
              <span class="font-label-sm text-[10px] text-outline">${r.length} CHAPTER${r.length===1?"":"S"}</span>
            </div>
            <h1 class="font-headline-md text-lg font-bold text-on-surface mt-2">${R(a.name)}</h1>
            ${a.description?`<p class="font-body-md text-xs text-on-surface-variant mt-1">${R(a.description)}</p>`:""}
          </div>

          <!-- Create Chapter Input Panel -->
          <div id="create-chapter-panel" class="hidden tactile-card bg-surface-container rounded-2xl p-4 border border-primary/30 shadow-md">
            <div class="flex items-center justify-between pb-2 border-b border-dashed border-outline-variant/30 mb-3">
              <span class="font-label-sm text-[10px] text-primary uppercase font-bold tracking-wider">NEW CHAPTER</span>
              <button id="btn-cancel-create-chapter" type="button" class="text-outline hover:text-on-surface">
                <span class="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form id="form-create-chapter" class="space-y-3">
              <input
                id="input-chapter-name"
                type="text"
                placeholder="Chapter Title (e.g., Section 1, Field Notes)..."
                required
                class="w-full bg-surface-container-highest/60 border border-outline-variant/30 rounded-xl px-3 py-2 font-body-md text-sm text-on-surface placeholder:text-outline-variant/50 focus:outline-none focus:border-primary"
              />
              <div class="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  class="px-4 py-2 bg-primary text-on-primary rounded-xl font-label-md text-xs font-bold uppercase transition-transform active:scale-[0.98]"
                >
                  CREATE CHAPTER
                </button>
              </div>
            </form>
          </div>

          <!-- Chapter List -->
          ${r.length===0?`
            <div class="tactile-card bg-surface-container/50 border border-dashed border-outline-variant/40 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3">
              <span class="material-symbols-outlined text-[36px] text-outline-variant">bookmark_border</span>
              <span class="font-label-md text-xs text-outline tracking-wider uppercase">NO CHAPTERS YET</span>
              <p class="font-body-md text-xs text-outline-variant max-w-xs">
                Add your first chapter to start writing pages inside this notebook.
              </p>
            </div>
          `:`
            <div class="space-y-3 w-full">
              ${r.map((n,s)=>`
                <div
                  data-chapter-card="${n.id}"
                  class="tactile-card group relative flex items-center justify-between bg-surface-container rounded-2xl p-4 shadow-sm border border-surface-container-highest/50 cursor-pointer hover:border-outline-variant/60 transition-all active:scale-[0.99]"
                >
                  <div class="flex items-center gap-3">
                    <span class="font-label-md text-xs font-bold text-outline">
                      ${String(s+1).padStart(2,"0")}.
                    </span>
                    <div>
                      <h3 class="font-headline-md text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                        ${R(n.name)}
                      </h3>
                      <span class="font-label-sm text-[10px] text-outline-variant">
                        ${n.pages?`${n.pages.length} PAGES`:"OPEN TO VIEW PAGES"}
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      data-delete-chapter="${n.id}"
                      aria-label="Delete Chapter"
                      class="p-1.5 text-outline hover:text-error transition-colors"
                    >
                      <span class="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                    <span class="material-symbols-outlined text-[18px] text-outline-variant group-hover:text-primary transition-colors">
                      chevron_right
                    </span>
                  </div>
                </div>
              `).join("")}
            </div>
          `}

        </div>
        ${A(t.searchOpen,t.searchTerm,"Search chapters...")}
      </main>
      ${N("notes")}
    </div>
  `}function R(t){return t?t.replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a]):""}function We(t){const a=t.currentChapter||{name:"CHAPTER",pages:[]},r=a.pages||[],n=t.currentPage||(r.length>0?r[0]:null),s={saved:{text:"SAVED",icon:"check_circle",color:"text-primary"},saving:{text:"SAVING...",icon:"sync",color:"text-outline animate-spin"},unsaved:{text:"UNSAVED CHANGES",icon:"edit",color:"text-outline-variant"},failed:{text:"SAVE FAILED (RETRYING)",icon:"warning",color:"text-error"}},o=s[t.saveStatus]||s.saved;return`
    <div class="min-h-screen flex flex-col bg-surface text-on-surface selection:bg-surface-container-highest">
      ${$("PAGES")}

      <main class="flex-1 flex flex-col relative w-full pt-20 pb-28 px-margin bg-surface">
        <div class="flex flex-col w-full max-w-2xl mx-auto space-y-4 pt-4 select-none">

          <!-- Top Navigation & Controls -->
          <div class="flex items-center justify-between px-1">
            <button
              id="btn-back-to-chapters"
              type="button"
              class="flex items-center gap-1 text-xs font-label-md text-outline hover:text-on-surface transition-colors"
            >
              <span class="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>${L(a.name||"CHAPTER")}</span>
            </button>

            <!-- Save Status Indicator -->
            <div class="flex items-center gap-1.5 font-label-sm text-[10px] ${o.color}">
              <span class="material-symbols-outlined text-[14px]">${o.icon}</span>
              <span>${o.text}</span>
            </div>
          </div>

          <!-- Page Switcher Tabs -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            ${r.map((u,b)=>{const f=n&&n.id===u.id;return`
                <button
                  type="button"
                  data-select-page="${u.id}"
                  class="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-label-md transition-all ${f?"bg-primary text-on-primary border-primary shadow-sm font-bold":"bg-surface-container text-outline border-surface-container-highest/60 hover:text-on-surface"}"
                >
                  <span>${L(u.title||`PAGE ${b+1}`)}</span>
                </button>
              `}).join("")}

            <button
              id="btn-create-page"
              type="button"
              class="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-surface-container rounded-full border border-dashed border-outline-variant/60 text-xs font-label-md text-primary hover:border-primary transition-colors"
            >
              <span class="material-symbols-outlined text-[15px]">add</span>
              <span>ADD PAGE</span>
            </button>
          </div>

          ${n?`
            <!-- Editor Card -->
            <div class="tactile-card bg-surface-container rounded-2xl p-5 border border-surface-container-highest/50 shadow-sm flex flex-col space-y-4">

              <!-- Page Title & Actions -->
              <div class="flex items-center justify-between pb-3 border-b border-dashed border-outline-variant/30 gap-2">
                <input
                  id="page-title-input"
                  type="text"
                  value="${L(n.title||"")}"
                  placeholder="Page Title..."
                  class="flex-1 bg-transparent font-headline-md text-lg font-bold text-on-surface placeholder:text-outline-variant/40 focus:outline-none"
                />
                <button
                  id="btn-delete-current-page"
                  type="button"
                  data-page-id="${n.id}"
                  aria-label="Delete Page"
                  class="p-1.5 text-outline hover:text-error transition-colors"
                >
                  <span class="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>

              <!-- Page Content Editor -->
              <div>
                <textarea
                  id="page-content-input"
                  rows="12"
                  placeholder="Type tactile notes, transcriptions, markdown, or optical analysis..."
                  class="w-full bg-surface-container-highest/30 border border-outline-variant/20 rounded-xl p-3.5 font-body-md text-sm text-on-surface leading-relaxed placeholder:text-outline-variant/40 focus:outline-none focus:border-outline-variant/60 transition-colors resize-y"
                >${L(n.content||"")}</textarea>
              </div>

              <!-- Attachments / Uploads Section -->
              <div class="pt-3 border-t border-dashed border-outline-variant/30">
                <div class="flex items-center justify-between mb-3">
                  <span class="font-label-sm text-[10px] text-outline uppercase font-semibold tracking-wider">
                    ATTACHED MEDIA (${(n.uploads||[]).length})
                  </span>
                  <label class="flex items-center gap-1 text-xs font-label-md text-primary cursor-pointer hover:underline">
                    <span class="material-symbols-outlined text-[15px]">upload</span>
                    <span>ATTACH FILE</span>
                    <input id="input-page-upload" type="file" accept="image/*" class="hidden" />
                  </label>
                </div>

                ${(n.uploads||[]).length>0?`
                  <div class="grid grid-cols-3 gap-2">
                    ${n.uploads.map(u=>`
                      <div class="relative group rounded-xl overflow-hidden aspect-video bg-surface-container-highest border border-outline-variant/30">
                        <img src="${u.url}" alt="Attachment" class="w-full h-full object-cover" />
                        <button
                          type="button"
                          data-delete-page-upload="${u.id}"
                          class="absolute top-1 right-1 p-1 bg-surface/80 rounded-full text-error opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span class="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </div>
                    `).join("")}
                  </div>
                `:`
                  <div class="text-xs font-body-md text-outline-variant/70 italic">
                    No images attached to this page. Use the camera or upload a file.
                  </div>
                `}
              </div>

            </div>
          `:`
            <div class="tactile-card bg-surface-container/50 border border-dashed border-outline-variant/40 rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-3">
              <span class="material-symbols-outlined text-[40px] text-outline-variant">description</span>
              <span class="font-label-md text-xs text-outline tracking-wider uppercase">NO PAGES IN THIS CHAPTER</span>
              <button
                id="btn-create-first-page"
                type="button"
                class="px-4 py-2 bg-primary text-on-primary rounded-xl font-label-md text-xs font-bold uppercase transition-transform active:scale-[0.98]"
              >
                CREATE FIRST PAGE
              </button>
            </div>
          `}

        </div>
        ${A(t.searchOpen,t.searchTerm,"Search page contents...")}
      </main>
      ${N("notes")}
    </div>
  `}function L(t){return t?t.replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a]):""}function Qe(t){const{flashing:a,captureCount:r,streaming:n,loading:s,error:o,facingMode:u,lastCapturedPhoto:b,isInsecureContext:f,uploading:h}=t.camera,m=t.settings.ratios[t.settings.ratioIndex]||"4:3";return`
    <div class="bg-surface text-on-surface font-body-md text-body-md min-h-screen flex flex-col selection:bg-surface-container-highest relative overflow-hidden select-none">
      <main class="flex-1 flex flex-col relative w-full h-full min-h-screen bg-black">
        <div class="relative w-full h-full min-h-screen flex flex-col justify-between overflow-hidden">
          
          <!-- Live On-Device Video Stream Viewfinder -->
          <video 
            id="camera-stream" 
            autoplay 
            playsinline 
            muted 
            class="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-300 ${u==="user"?"scale-x-[-1]":""} ${s||o?"opacity-20":"opacity-100"}"
          ></video>

          <!-- Loading State Overlay -->
          ${s?`
            <div class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface/80 backdrop-blur-sm p-6 text-center">
              <div class="relative w-20 h-20 mb-4 flex items-center justify-center">
                <div class="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"></div>
                <div class="w-16 h-16 rounded-full border border-dashed border-primary animate-spin"></div>
                <span class="material-symbols-outlined absolute text-primary text-[28px]">photo_camera</span>
              </div>
              <span class="font-label-md text-xs tracking-[0.2em] uppercase text-primary font-bold">INITIALIZING SENSOR</span>
              <span class="font-label-sm text-[10px] text-outline tracking-wider mt-1">CONNECTING ON-DEVICE CAMERA</span>
            </div>
          `:""}

          <!-- Camera Error / Permission Denied Overlay -->
          ${o?`
            <div class="absolute inset-0 z-25 flex flex-col items-center justify-center bg-surface/90 backdrop-blur-md p-6 text-center">
              <div class="w-16 h-16 rounded-2xl bg-surface-container-high border border-outline/30 flex items-center justify-center mb-4 text-outline">
                <span class="material-symbols-outlined text-[32px]">${f?"lock":"videocam_off"}</span>
              </div>
              <span class="font-headline-md text-sm font-bold tracking-widest text-on-surface uppercase mb-2">
                ${f?"SECURE CONTEXT REQUIRED":"OPTICAL SENSOR OFFLINE"}
              </span>
              <p class="font-body-md text-xs text-on-surface-variant max-w-xs mb-5 leading-relaxed">
                ${o}
              </p>
              ${f?`
                <div class="font-label-sm text-[10px] text-outline tracking-wider uppercase bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/30">
                  BROWSER SECURITY PROTOCOL
                </div>
              `:`
                <button 
                  id="btn-retry-camera" 
                  type="button" 
                  class="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-xs font-bold tracking-wider uppercase active:scale-95 transition-transform flex items-center gap-2 shadow-lg"
                >
                  <span class="material-symbols-outlined text-[16px]">refresh</span>
                  <span>GRANT / RETRY ACCESS</span>
                </button>
              `}
            </div>
          `:""}

          <!-- Shutter visual flash overlay -->
          <div 
            id="shutter-flash"
            class="absolute inset-0 bg-primary pointer-events-none transition-opacity duration-150 z-30 ${a?"opacity-90":"opacity-0"}"
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
              <span class="tracking-wider uppercase text-[11px]">${u==="user"?"FRONT":"REAR"}</span>
            </button>

            <!-- Center Sensor Live Indicator -->
            <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high/70 backdrop-blur-md border border-white/5 font-label-sm text-[10px] tracking-wider text-outline">
              <span class="w-2 h-2 rounded-full ${n?"bg-emerald-400 animate-pulse":"bg-amber-400"}"></span>
              <span>${h?"UPLOADING...":n?"LIVE":"STANDBY"}</span>
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
                <span class="text-[10px] font-label-sm tracking-widest text-outline bg-surface-container-lowest/60 px-2 py-0.5 rounded backdrop-blur-sm uppercase">${m}</span>
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
                <span class="text-[10px] font-label-sm tracking-widest text-outline bg-surface-container-lowest/60 px-2 py-0.5 rounded backdrop-blur-sm">${u==="user"?"FRONT":"ENV"} 48M</span>
              </div>
            </div>
          </div>

          <!-- Bottom Controls -->
          <div class="relative z-20 w-full mt-auto flex flex-col items-center gap-space-md pb-safe mb-4 px-margin">
            
            ${r>0?`
              <span class="font-label-sm text-[10px] text-outline uppercase tracking-widest bg-surface-container-lowest/70 backdrop-blur-md px-3 py-0.5 rounded-full border border-white/5">
                ${r} ${r===1?"FRAME":"FRAMES"} RECORDED
              </span>
            `:""}

            <!-- Shutter Action Bar -->
            <div class="w-full max-w-sm flex items-center justify-between px-6">
              
              <!-- Left: Last captured photo thumbnail -->
              <div class="w-14 h-14 flex items-center justify-center">
                ${b?`
                  <a 
                    data-link 
                    href="/gallery" 
                    aria-label="View Last Capture in Gallery" 
                    class="relative w-12 h-12 rounded-xl overflow-hidden border border-primary/50 shadow-md active:scale-95 transition-transform group"
                  >
                    <img src="${b}" alt="Last capture thumbnail" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors"></div>
                  </a>
                `:`
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
                  <span class="text-[10px] font-label-md font-bold text-primary leading-none mt-1 uppercase">${m}</span>
                </button>
              </div>

            </div>

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
    </div>
  `}function Ze(t,a){const r=`$${a.toLocaleString(void 0,{minimumFractionDigits:2})}`;return`
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
            <div class="h-1.5 flex-1 mx-2 rounded-full transition-all duration-300 ${t?"bg-primary":"bg-surface-container-highest"}"></div>
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
          <span class="w-1.5 h-1.5 rounded-full transition-colors ${t?"bg-primary scale-125":"bg-primary"}"></span>
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
          <span class="font-label-sm text-[11px] text-outline">${r}</span>
          <span class="font-label-sm text-[10px] text-outline-variant">9 bills</span>
        </div>
        <div class="peel-corner absolute bottom-0 right-0 w-8 h-8 pointer-events-none">
          <div class="peel-flap absolute bottom-0 right-0 w-full h-full bg-surface-container-highest transition-all duration-300 group-hover:w-10 group-hover:h-10 rounded-tl-lg shadow-[-3px_-3px_8px_rgba(0,0,0,0.6)]"></div>
          <div class="peel-under absolute bottom-0 right-0 w-full h-full bg-surface-container-lowest -z-10"></div>
        </div>
      </div>
    </div>
  `}function Je(t,a=null){const r=t.camera.capturedPhotos||[];return`
    <div class="min-h-screen flex flex-col bg-surface text-on-surface selection:bg-surface-container-highest relative">
      ${$("Gallery")}
      
      <main class="flex-1 flex flex-col relative w-full pt-16 pb-28 px-margin bg-surface max-w-lg mx-auto">
        
        <!-- Camera Captures Section -->
        <div class="flex flex-col w-full mb-8 pt-6 select-none">
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-dashed border-outline-variant/30">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span class="font-label-sm text-[11px] text-outline font-semibold tracking-wider uppercase">
                OPTICAL ARCHIVE (${r.length})
              </span>
            </div>
            ${r.length>0?`
              <button 
                id="btn-clear-gallery" 
                type="button" 
                class="font-label-sm text-[10px] text-outline hover:text-error transition-colors uppercase tracking-wider flex items-center gap-1"
              >
                <span class="material-symbols-outlined text-[13px]">delete_sweep</span>
                <span>CLEAR</span>
              </button>
            `:""}
          </div>

          ${r.length>0?`
            <div class="grid grid-cols-2 gap-3.5 w-full">
              ${r.map(n=>`
                <div class="tactile-card group relative bg-surface-container rounded-2xl overflow-hidden border border-surface-container-highest/50 shadow-sm flex flex-col">
                  <!-- Photo Thumbnail View -->
                  <div 
                    data-view-photo="${n.url}" 
                    class="relative aspect-[4/3] w-full overflow-hidden bg-black cursor-pointer"
                  >
                    <img 
                      src="${n.url}" 
                      alt="Capture ${n.timestamp}" 
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity"></div>
                    
                    <span class="absolute bottom-1.5 left-2 font-label-sm text-[9px] text-white/80 bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm uppercase">
                      ${n.ratio||"4:3"}
                    </span>
                  </div>

                  <!-- Metadata & Action Footer -->
                  <div class="p-2.5 flex items-center justify-between bg-surface-container">
                    <span class="font-label-sm text-[10px] text-outline tracking-wider">
                      ${n.timestamp}
                    </span>
                    <div class="flex items-center gap-1">
                      <a 
                        href="${n.url}" 
                        download="capture_${n.id}.jpg" 
                        title="Download Photo"
                        class="w-7 h-7 rounded-lg flex items-center justify-center text-outline hover:text-primary hover:bg-surface-container-high transition-colors"
                      >
                        <span class="material-symbols-outlined text-[15px]">download</span>
                      </a>
                      <button 
                        data-delete-photo="${n.id}" 
                        title="Delete Capture"
                        type="button" 
                        class="w-7 h-7 rounded-lg flex items-center justify-center text-outline hover:text-error hover:bg-surface-container-high transition-colors"
                      >
                        <span class="material-symbols-outlined text-[15px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              `).join("")}
            </div>
          `:`
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
            ${Ze(t.cardOneActive,t.cardTwoValue)}
          </div>
        </div>

        ${A(t.searchOpen,t.searchTerm,"Search gallery & assets...")}
      </main>

      <!-- Lightbox Photo Preview Modal -->
      ${a?`
        <div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl p-4 select-none">
          <div class="absolute top-4 right-4 z-10 flex items-center gap-3">
            <a 
              href="${a}" 
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
            <img src="${a}" alt="Full resolution optical capture" class="max-w-full max-h-[80vh] object-contain">
          </div>
          
          <div class="mt-4 flex items-center gap-2 font-label-sm text-xs text-outline tracking-widest uppercase">
            <span class="w-2 h-2 rounded-full bg-primary"></span>
            <span>RAW CAPTURE • SENSOR RECORD</span>
          </div>
        </div>
      `:""}

      ${N("gallery")}
    </div>
  `}function Xe(t){const{modes:a,modeIndex:r,tones:n,toneIndex:s,ratios:o,ratioIndex:u,hapticOn:b,privacyOn:f}=t.settings,h=a[r],m=n[s],g=o[u];return`
    <div class="min-h-screen flex flex-col bg-surface text-on-surface selection:bg-surface-container-highest">
      ${$("SETTINGS",!0)}
      
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
                  <span class="font-label-md text-xs text-primary" id="mode-val">${h}</span>
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
                  <span class="font-label-md text-xs text-on-surface-variant" id="tone-val">${m}</span>
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
                  <span class="font-label-md text-xs text-on-surface-variant" id="ratio-val">${g}</span>
                  <span class="material-symbols-outlined text-[16px] text-outline-variant">chevron_right</span>
                </div>
              </button>
              <div class="w-full py-3 flex items-center justify-between">
                <span class="font-body-md text-sm text-on-surface">Tactile Haptics</span>
                <button 
                  id="haptic-toggle" 
                  class="w-9 h-5 rounded-full relative transition-colors focus:outline-none ${b?"bg-primary":"bg-surface-container-highest"}"
                  type="button"
                >
                  <span 
                    id="haptic-dot"
                    class="block w-3.5 h-3.5 rounded-full bg-surface-container-lowest transition-transform ${b?"translate-x-4":"translate-x-1"}"
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
                  <span class="font-label-md text-xs text-primary">${f?"ON":"OFF"}</span>
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

        ${A(t.searchOpen,t.searchTerm,"Search settings...")}
      </main>
      
      ${N("settings")}
    </div>
  `}function et(t){return`
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
  `}let v=null,C=!1;function tt(){try{const t=window.AudioContext||window.webkitAudioContext;if(!t)return;const a=new t,r=a.createOscillator(),n=a.createGain();r.type="triangle",r.frequency.setValueAtTime(650,a.currentTime),r.frequency.exponentialRampToValueAtTime(80,a.currentTime+.06),n.gain.setValueAtTime(.35,a.currentTime),n.gain.exponentialRampToValueAtTime(.001,a.currentTime+.06),r.connect(n),n.connect(a.destination),r.start(),r.stop(a.currentTime+.07),setTimeout(()=>{try{const s=a.createOscillator(),o=a.createGain();s.type="sine",s.frequency.setValueAtTime(320,a.currentTime),s.frequency.exponentialRampToValueAtTime(60,a.currentTime+.05),o.gain.setValueAtTime(.18,a.currentTime),o.gain.exponentialRampToValueAtTime(.001,a.currentTime+.05),s.connect(o),o.connect(a.destination),s.start(),s.stop(a.currentTime+.05)}catch{}},45)}catch{}}function at(){if(e.settings.hapticOn&&typeof navigator<"u"&&navigator.vibrate)try{navigator.vibrate([18,32,22])}catch{}}async function F(){var a;if(C)return;if(typeof window<"u"&&!window.isSecureContext){e.camera.loading=!1,e.camera.streaming=!1,e.camera.isInsecureContext=!0,e.camera.error="Camera access requires HTTPS. Open the app using its HTTPS address (or localhost).",d();return}if(!((a=navigator==null?void 0:navigator.mediaDevices)!=null&&a.getUserMedia)){e.camera.loading=!1,e.camera.streaming=!1,e.camera.isInsecureContext=!1,e.camera.error="This browser does not support camera hardware streaming.",d();return}C=!0,e.camera.loading=!0,e.camera.error=null,e.camera.isInsecureContext=!1,d(),v&&(v.getTracks().forEach(r=>r.stop()),v=null);const t=e.camera.facingMode||"environment";try{let r;try{r=await navigator.mediaDevices.getUserMedia({audio:!1,video:{facingMode:{ideal:t},width:{ideal:1920},height:{ideal:1080}}})}catch(s){console.warn("Preferred camera facingMode unavailable, falling back:",s),r=await navigator.mediaDevices.getUserMedia({audio:!1,video:!0})}v=r,e.camera.streaming=!0,e.camera.loading=!1,e.camera.error=null,C=!1,d();const n=document.getElementById("camera-stream");n&&(n.srcObject=r,n.play().catch(s=>console.warn("Camera video play error:",s)))}catch(r){console.error("Camera access error:",r),e.camera.loading=!1,e.camera.streaming=!1,C=!1,r.name==="NotAllowedError"||r.name==="PermissionDeniedError"?e.camera.error="Camera permission denied. Please grant permission in your browser to use the viewfinder.":r.name==="NotFoundError"||r.name==="DevicesNotFoundError"?e.camera.error="No camera hardware found on this device.":r.name==="NotReadableError"||r.name==="TrackStartError"?e.camera.error="Camera is currently in use by another application.":e.camera.error=r.message||"Unable to access camera.",d()}}function de(){v&&(v.getTracks().forEach(t=>{try{t.stop()}catch{}}),v=null),e.camera.streaming=!1,e.camera.loading=!1}function rt(){const t=document.getElementById("camera-stream");t&&(v&&v.active&&v.getVideoTracks().some(a=>a.readyState==="live")?(t.srcObject!==v&&(t.srcObject=v),t.play().catch(a=>console.warn("Camera stream play catch:",a))):!C&&!e.camera.error&&F())}async function nt(){const t=e.camera.facingMode;e.camera.facingMode=t==="environment"?"user":"environment",await F()}async function st(){const t=document.getElementById("camera-stream");let a=null,r=null;if(t&&t.videoWidth>0&&t.videoHeight>0)try{const n=document.createElement("canvas");n.width=t.videoWidth,n.height=t.videoHeight;const s=n.getContext("2d");e.camera.facingMode==="user"&&(s.translate(n.width,0),s.scale(-1,1)),s.drawImage(t,0,0,n.width,n.height),r=n.toDataURL("image/jpeg",.92),a=await new Promise(o=>n.toBlob(o,"image/jpeg",.92))}catch(n){console.warn("Canvas frame capture error:",n)}if(e.camera.flashing=!0,e.camera.captureCount+=1,tt(),at(),d(),setTimeout(()=>{e.camera.flashing=!1,d()},120),a){e.camera.uploading=!0,d();try{const n=new FormData;n.append("file",a,`capture_${Date.now()}.jpg`);const s=await fetch(`${M}/api/uploads`,{method:"POST",credentials:"include",body:n});if(s.ok){const o=await s.json(),u={id:o.id,url:o.url,timestamp:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"}),date:new Date().toLocaleDateString([],{month:"short",day:"numeric",year:"numeric"}),width:(t==null?void 0:t.videoWidth)||1920,height:(t==null?void 0:t.videoHeight)||1080,ratio:e.settings.ratios[e.settings.ratioIndex]||"4:3"};e.camera.lastCapturedPhoto=o.url,e.camera.capturedPhotos.unshift(u)}else{const o={id:"local_"+Date.now(),url:r,timestamp:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),date:"Local Draft",ratio:e.settings.ratios[e.settings.ratioIndex]||"4:3"};e.camera.lastCapturedPhoto=r,e.camera.capturedPhotos.unshift(o)}}catch(n){console.warn("Upload error, saved locally:",n),r&&(e.camera.lastCapturedPhoto=r,e.camera.capturedPhotos.unshift({id:"local_"+Date.now(),url:r,timestamp:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),date:"Local Draft"}))}finally{e.camera.uploading=!1,d()}}}async function me(){if(e.user)try{const t=await Ge();Array.isArray(t)&&(e.camera.capturedPhotos=t.map(a=>({id:a.id,url:a.url,timestamp:new Date(a.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),date:new Date(a.created_at).toLocaleDateString([],{month:"short",day:"numeric",year:"numeric"}),ratio:"4:3"})),e.camera.capturedPhotos.length>0&&(e.camera.lastCapturedPhoto=e.camera.capturedPhotos[0].url),d())}catch(t){console.warn("Failed to load gallery uploads from server:",t)}}let D=null,I=!1,S="",_=null;function j(t){if(e.authLoading){t.innerHTML=`
      <div class="min-h-screen flex flex-col items-center justify-center bg-surface text-on-surface">
        <div class="relative w-16 h-16 mb-4 flex items-center justify-center">
          <div class="w-12 h-12 rounded-full border border-dashed border-primary animate-spin"></div>
        </div>
        <span class="font-label-md text-xs tracking-widest uppercase text-outline">INITIALIZING VAULT...</span>
      </div>
    `;return}if(!e.user){de(),t.innerHTML=qe(e,I,S),ot();return}const a=e.currentRoute;let r="";const n=a.match(/^\/notebooks\/([a-zA-Z0-9_-]+)$/),s=a.match(/^\/notebooks\/([a-zA-Z0-9_-]+)\/chapters\/([a-zA-Z0-9_-]+)$/);a==="/camera"?r=Qe(e):a==="/gallery"?r=Je(e,D):a==="/settings"?r=Xe(e):a==="/notifications"?r=et():s?r=We(e):n?r=Ye(e):r=ze(e);const o=document.getElementById("search-input"),u=document.activeElement===o,b=o?o.selectionStart:null,f=document.activeElement?document.activeElement.id:null,h=document.activeElement?document.activeElement.selectionStart:null,m=document.activeElement?document.activeElement.selectionEnd:null;if(t.innerHTML=r,u){const g=document.getElementById("search-input");g&&(g.focus(),b!==null&&g.setSelectionRange(b,b))}else if(f&&(f==="page-content-input"||f==="page-title-input")){const g=document.getElementById(f);g&&(g.focus(),h!==null&&g.setSelectionRange(h,m))}a==="/camera"?rt():de(),it()}function ot(){const t=document.getElementById("tab-login"),a=document.getElementById("tab-register"),r=document.getElementById("auth-form");t&&t.addEventListener("click",()=>{I=!1,S="",d()}),a&&a.addEventListener("click",()=>{I=!0,S="",d()}),r&&r.addEventListener("submit",async n=>{var f,h;n.preventDefault();const s=(f=document.getElementById("auth-email"))==null?void 0:f.value.trim(),o=(h=document.getElementById("auth-password"))==null?void 0:h.value;if(!s||!o)return;const u=document.getElementById("btn-auth-submit"),b=document.getElementById("btn-auth-text");u&&(u.disabled=!0),b&&(b.textContent=I?"CREATING...":"AUTHENTICATING...");try{I?await Ne(s,o):await Ae(s,o);const m={email:s};e.user=m,S="",e.notebooksLoading=!0,d(),e.notebooks=await fe().catch(()=>[]),me()}catch(m){S=m.message||"Authentication failed. Please verify credentials."}finally{e.notebooksLoading=!1,d()}})}function it(){const t=document.getElementById("btn-logout");t&&t.addEventListener("click",async()=>{try{await Oe()}catch{}e.user=null,e.notebooks=[],e.currentNotebook=null,e.currentChapter=null,e.currentPage=null,w("/")});const a=document.getElementById("nav-search-btn");a&&a.addEventListener("click",()=>ye());const r=document.getElementById("close-search-btn");r&&r.addEventListener("click",()=>{e.searchTerm?oe(""):we()});const n=document.getElementById("search-input");n&&n.addEventListener("input",i=>{oe(i.target.value)});const s=document.getElementById("btn-show-create-notebook"),o=document.getElementById("create-notebook-panel"),u=document.getElementById("btn-cancel-create-notebook"),b=document.getElementById("form-create-notebook");s&&o&&s.addEventListener("click",()=>{var i;o.classList.remove("hidden"),(i=document.getElementById("input-notebook-name"))==null||i.focus()}),u&&o&&u.addEventListener("click",()=>{o.classList.add("hidden")}),b&&b.addEventListener("submit",async i=>{var p,T;i.preventDefault();const c=(p=document.getElementById("input-notebook-name"))==null?void 0:p.value.trim(),l=(T=document.getElementById("input-notebook-desc"))==null?void 0:T.value.trim();if(c)try{const y=await Le({name:c,description:l});e.notebooks.unshift(y),o==null||o.classList.add("hidden"),d()}catch(y){alert(y.message||"Failed to create notebook")}}),document.querySelectorAll("[data-notebook-card]").forEach(i=>{i.addEventListener("click",async c=>{if(c.target.closest("[data-delete-notebook]"))return;const l=i.getAttribute("data-notebook-card");if(l)try{const p=await je(l);e.currentNotebook=p,w(`/notebooks/${l}`)}catch(p){alert(p.message||"Failed to load notebook")}})}),document.querySelectorAll("[data-delete-notebook]").forEach(i=>{i.addEventListener("click",async c=>{c.stopPropagation();const l=i.getAttribute("data-delete-notebook");if(l&&confirm("Permanently delete this notebook and all its chapters?"))try{await Re(l),e.notebooks=e.notebooks.filter(p=>p.id!==l),d()}catch(p){alert(p.message||"Failed to delete notebook")}})});const f=document.getElementById("btn-back-to-notebooks");f&&f.addEventListener("click",()=>{e.currentNotebook=null,w("/")});const h=document.getElementById("btn-show-create-chapter"),m=document.getElementById("create-chapter-panel"),g=document.getElementById("btn-cancel-create-chapter"),V=document.getElementById("form-create-chapter");h&&m&&h.addEventListener("click",()=>{var i;m.classList.remove("hidden"),(i=document.getElementById("input-chapter-name"))==null||i.focus()}),g&&m&&g.addEventListener("click",()=>{m.classList.add("hidden")}),V&&e.currentNotebook&&V.addEventListener("submit",async i=>{var l;i.preventDefault();const c=(l=document.getElementById("input-chapter-name"))==null?void 0:l.value.trim();if(c)try{const p=await _e(e.currentNotebook.id,{name:c});e.currentNotebook.chapters||(e.currentNotebook.chapters=[]),e.currentNotebook.chapters.push(p),m==null||m.classList.add("hidden"),d()}catch(p){alert(p.message||"Failed to create chapter")}}),document.querySelectorAll("[data-chapter-card]").forEach(i=>{i.addEventListener("click",async c=>{var p,T;if(c.target.closest("[data-delete-chapter]"))return;const l=i.getAttribute("data-chapter-card");if(!(!l||!e.currentNotebook))try{const y=await De(l);e.currentChapter={id:l,name:((T=(p=i.querySelector("h3"))==null?void 0:p.textContent)==null?void 0:T.trim())||"Chapter",pages:y||[]},e.currentPage=y.length>0?y[0]:null,w(`/notebooks/${e.currentNotebook.id}/chapters/${l}`)}catch(y){alert(y.message||"Failed to open chapter")}})}),document.querySelectorAll("[data-delete-chapter]").forEach(i=>{i.addEventListener("click",async c=>{c.stopPropagation();const l=i.getAttribute("data-delete-chapter");if(l&&confirm("Permanently delete this chapter and all its pages?"))try{await Be(l),e.currentNotebook&&e.currentNotebook.chapters&&(e.currentNotebook.chapters=e.currentNotebook.chapters.filter(p=>p.id!==l)),d()}catch(p){alert(p.message||"Failed to delete chapter")}})});const U=document.getElementById("btn-back-to-chapters");U&&e.currentNotebook&&U.addEventListener("click",()=>{e.currentChapter=null,e.currentPage=null,w(`/notebooks/${e.currentNotebook.id}`)}),document.querySelectorAll("[data-select-page]").forEach(i=>{i.addEventListener("click",async()=>{const c=i.getAttribute("data-select-page");if(!(!c||e.currentPage&&e.currentPage.id===c))try{const l=await Fe(c);e.currentPage=l,e.saveStatus="saved",d()}catch(l){console.warn("Failed to switch page:",l)}})});const H=document.getElementById("btn-create-page")||document.getElementById("btn-create-first-page");H&&e.currentChapter&&H.addEventListener("click",async()=>{var i;try{const c=await Me(e.currentChapter.id,{title:`Page ${(((i=e.currentChapter.pages)==null?void 0:i.length)||0)+1}`,content:""});e.currentChapter.pages||(e.currentChapter.pages=[]),e.currentChapter.pages.push(c),e.currentPage=c,e.saveStatus="saved",d()}catch(c){alert(c.message||"Failed to create page")}});const G=document.getElementById("btn-delete-current-page");G&&e.currentPage&&G.addEventListener("click",async()=>{if(!confirm(`Delete page "${e.currentPage.title}"?`))return;const i=e.currentPage.id;try{await Ue(i),e.currentChapter&&e.currentChapter.pages&&(e.currentChapter.pages=e.currentChapter.pages.filter(c=>c.id!==i),e.currentPage=e.currentChapter.pages.length>0?e.currentChapter.pages[0]:null),d()}catch(c){alert(c.message||"Failed to delete page")}});const E=document.getElementById("page-title-input"),k=document.getElementById("page-content-input");function q(){if(!e.currentPage)return;const i=e.currentPage.id,c=(E==null?void 0:E.value)??e.currentPage.title,l=(k==null?void 0:k.value)??e.currentPage.content;e.currentPage.title=c,e.currentPage.content=l;try{sessionStorage.setItem(`draft:${i}`,JSON.stringify({title:c,content:l,time:Date.now()}))}catch{}e.saveStatus="unsaved",_&&clearTimeout(_),_=setTimeout(async()=>{e.saveStatus="saving",d();try{await Ve(i,{title:c,content:l}),e.saveStatus="saved";try{sessionStorage.removeItem(`draft:${i}`)}catch{}}catch(p){console.error("Autosave failed:",p),e.saveStatus="failed"}finally{d()}},1500)}E&&E.addEventListener("input",q),k&&k.addEventListener("input",q);const z=document.getElementById("input-page-upload");z&&e.currentPage&&z.addEventListener("change",async i=>{var l;const c=(l=i.target.files)==null?void 0:l[0];if(c)try{const p=await He(e.currentPage.id,c);e.currentPage.uploads||(e.currentPage.uploads=[]),e.currentPage.uploads.push(p),d()}catch(p){alert(p.message||"Upload failed")}}),document.querySelectorAll("[data-delete-page-upload]").forEach(i=>{i.addEventListener("click",async c=>{c.stopPropagation();const l=i.getAttribute("data-delete-page-upload");if(l)try{await le(l),e.currentPage&&e.currentPage.uploads&&(e.currentPage.uploads=e.currentPage.uploads.filter(p=>p.id!==l)),d()}catch(p){alert(p.message||"Failed to delete attachment")}})});const K=document.getElementById("shutter-trigger");K&&K.addEventListener("click",()=>st());const Y=document.getElementById("btn-flip-camera");Y&&Y.addEventListener("click",()=>nt());const W=document.getElementById("btn-retry-camera");W&&W.addEventListener("click",()=>F());const Q=document.getElementById("btn-quick-ratio");Q&&Q.addEventListener("click",()=>ie()),document.querySelectorAll("[data-delete-photo]").forEach(i=>{i.addEventListener("click",async c=>{c.stopPropagation();const l=i.getAttribute("data-delete-photo");if(l){try{await le(l)}catch{}Ee(l)}})});const Z=document.getElementById("btn-clear-gallery");Z&&Z.addEventListener("click",()=>{confirm("Clear all captured optical records from storage?")&&ke()}),document.querySelectorAll("[data-view-photo]").forEach(i=>{i.addEventListener("click",()=>{const c=i.getAttribute("data-view-photo");if(c){D=c;const l=document.getElementById("app");l&&j(l)}})});const J=document.getElementById("btn-close-modal");J&&J.addEventListener("click",()=>{D=null;const i=document.getElementById("app");i&&j(i)});const X=document.getElementById("btn-mode");X&&X.addEventListener("click",()=>Te());const ee=document.getElementById("btn-tone");ee&&ee.addEventListener("click",()=>Ce());const te=document.getElementById("btn-ratio");te&&te.addEventListener("click",()=>ie());const ae=document.getElementById("haptic-toggle");ae&&ae.addEventListener("click",()=>Ie());const re=document.getElementById("btn-privacy");re&&re.addEventListener("click",()=>Se());const ne=document.getElementById("btn-back");ne&&ne.addEventListener("click",()=>ve())}document.addEventListener("DOMContentLoaded",async()=>{const t=document.getElementById("app");xe(),Pe(),ge(()=>{j(t)}),e.authLoading=!0,j(t);try{const a=await $e();e.user=a,e.notebooksLoading=!0,d(),e.notebooks=await fe().catch(()=>[]),me()}catch{e.user=null,e.notebooks=[]}finally{e.authLoading=!1,e.notebooksLoading=!1,d()}window.addEventListener("auth:expired",()=>{e.user=null,e.notebooks=[],e.currentNotebook=null,e.currentChapter=null,e.currentPage=null,d()})});
