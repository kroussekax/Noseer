// Noseer Fluid Watery Search Deformation Controller

(function(global) {
  class SearchController {
    constructor() {
      this.isOpen = false;
      this.isAnimating = false;
      this.init();
    }

    init() {
      this.overlay = document.getElementById('search-overlay');
      this.container = document.getElementById('search-morph-box');
      this.input = document.getElementById('search-input');
      this.resultsBox = document.getElementById('search-results-list');
      this.btnSearchOrigin = document.getElementById('nav-btn-search');
      this.islandMain = document.querySelector('.island-main');
      this.btnClose = document.getElementById('btn-search-close');

      if (this.overlay) {
        this.overlay.addEventListener('click', (e) => {
          if (e.target === this.overlay) this.closeSearch();
        });
      }

      if (this.btnClose) {
        this.btnClose.addEventListener('click', () => this.closeSearch());
      }

      if (this.input) {
        this.input.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.input.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') this.closeSearch();
        });
      }
    }

    openSearch() {
      if (this.isOpen || this.isAnimating) return;
      this.isOpen = true;
      this.isAnimating = true;

      const overTheTop = global.NoseerStore.getSettings().overTheTopAnimations;
      const originRect = this.btnSearchOrigin ? this.btnSearchOrigin.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight - 50, width: 46, height: 46 };
      const islandRect = this.islandMain ? this.islandMain.getBoundingClientRect() : { left: window.innerWidth / 2 - 100, top: window.innerHeight - 50 };

      // Target position: horizontally centered, slightly above vertical center (~38vh)
      const targetWidth = Math.min(window.innerWidth - 48, 540);
      const targetHeight = 52;
      const targetLeft = (window.innerWidth - targetWidth) / 2;
      const targetTop = window.innerHeight * 0.38;

      this.overlay.classList.add('active');
      this.container.style.display = 'flex';
      this.container.style.opacity = '1';

      if (!overTheTop) {
        // Standard fast animation
        this.container.style.transition = 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
        this.container.style.left = `${targetLeft}px`;
        this.container.style.top = `${targetTop}px`;
        this.container.style.width = `${targetWidth}px`;
        this.container.style.height = `${targetHeight}px`;
        this.container.style.borderRadius = '26px';

        setTimeout(() => {
          this.isAnimating = false;
          if (this.input) {
            this.input.focus();
            this.input.value = '';
          }
          this.handleSearch('');
        }, 260);
        return;
      }

      // Over-The-Top Fluid Watery Deformation Multi-Stage Sequence:
      // Stage 0: Position at the search circle
      this.container.style.transition = 'none';
      this.container.style.left = `${originRect.left}px`;
      this.container.style.top = `${originRect.top}px`;
      this.container.style.width = `${originRect.width}px`;
      this.container.style.height = `${originRect.height}px`;
      this.container.style.borderRadius = '50%';
      this.container.classList.add('animating');

      // Force layout reflow
      this.container.getBoundingClientRect();

      // Step 1: Moves toward main island with watery fluid deformation
      const step1Left = islandRect.right + 4;
      const step1Top = originRect.top - 8;
      this.container.style.transition = 'all 0.24s cubic-bezier(0.4, 0, 0.2, 1)';
      this.container.style.left = `${step1Left}px`;
      this.container.style.top = `${step1Top}px`;

      setTimeout(() => {
        // Step 2: Arcs upward just before touching island and begins expanding horizontally
        const step2Left = targetLeft + (targetWidth * 0.2);
        const step2Top = targetTop + (window.innerHeight * 0.25);
        this.container.style.transition = 'all 0.26s cubic-bezier(0.2, 0.8, 0.2, 1)';
        this.container.style.left = `${step2Left}px`;
        this.container.style.top = `${step2Top}px`;
        this.container.style.width = `${Math.min(targetWidth * 0.6, 260)}px`;
        this.container.style.height = '48px';
        this.container.style.borderRadius = '30px';

        setTimeout(() => {
          // Step 3: Morphs smoothly into the final search bar slightly above vertical center
          this.container.style.transition = 'all 0.28s cubic-bezier(0.34, 1.25, 0.64, 1)';
          this.container.style.left = `${targetLeft}px`;
          this.container.style.top = `${targetTop}px`;
          this.container.style.width = `${targetWidth}px`;
          this.container.style.height = `${targetHeight}px`;
          this.container.style.borderRadius = '26px';

          setTimeout(() => {
            this.container.classList.remove('animating');
            this.isAnimating = false;
            if (this.input) {
              this.input.focus();
              this.input.value = '';
            }
            this.handleSearch('');
          }, 290);
        }, 260);
      }, 240);
    }

    closeSearch() {
      if (!this.isOpen || this.isAnimating) return;
      this.isAnimating = true;

      const overTheTop = global.NoseerStore.getSettings().overTheTopAnimations;
      const originRect = this.btnSearchOrigin ? this.btnSearchOrigin.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight - 50, width: 46, height: 46 };

      this.overlay.classList.remove('active');
      if (this.resultsBox) this.resultsBox.innerHTML = '';

      if (!overTheTop) {
        this.container.style.transition = 'all 0.2s ease-out';
        this.container.style.opacity = '0';
        this.container.style.transform = 'scale(0.95)';
        setTimeout(() => {
          this.container.style.display = 'none';
          this.container.style.transform = '';
          this.isOpen = false;
          this.isAnimating = false;
        }, 210);
        return;
      }

      // Reverse animation: Contracts -> moves downward -> returns toward island -> returns to search circle
      this.container.classList.add('animating');
      this.container.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      this.container.style.left = `${originRect.left}px`;
      this.container.style.top = `${originRect.top}px`;
      this.container.style.width = `${originRect.width}px`;
      this.container.style.height = `${originRect.height}px`;
      this.container.style.borderRadius = '50%';

      setTimeout(() => {
        this.container.style.display = 'none';
        this.container.classList.remove('animating');
        this.isOpen = false;
        this.isAnimating = false;
      }, 310);
    }

    handleSearch(query) {
      if (!this.resultsBox) return;
      query = (query || '').trim().toLowerCase();

      const notes = global.NoseerStore.getNotes();
      let matches = [];

      if (!query) {
        // Show recent notes
        matches = notes.slice(0, 4);
      } else {
        matches = notes.filter(n => {
          const inTitle = (n.title || '').toLowerCase().includes(query);
          const inCategory = (n.category || '').toLowerCase().includes(query);
          const inSubject = (n.subject || '').toLowerCase().includes(query);
          const inSummary = (n.summary || '').toLowerCase().includes(query);
          const inSections = (n.sections || []).some(s => (s.text || '').toLowerCase().includes(query));
          const inBill = n.billData && (
            (n.billData.merchant || '').toLowerCase().includes(query) ||
            n.billData.tree.some(t => t.items.some(i => i.name.toLowerCase().includes(query)))
          );
          return inTitle || inCategory || inSubject || inSummary || inSections || inBill;
        });
      }

      if (matches.length === 0) {
        this.resultsBox.innerHTML = `
          <div style="padding: 18px; text-align: center; color: var(--md-text-muted); font-size: 13px;">
            No matching notes found for "${this.escapeHtml(query)}"
          </div>
        `;
        return;
      }

      this.resultsBox.innerHTML = matches.map(n => `
        <div class="search-result-item" data-note-id="${n.id}">
          <div class="search-result-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
          </div>
          <div class="search-result-content">
            <div class="search-result-title">${this.escapeHtml(n.title)}</div>
            <div class="search-result-sub">
              <span>${this.escapeHtml(n.category)}</span> • <span>${this.escapeHtml(n.subject || 'General')}</span>
            </div>
          </div>
        </div>
      `).join('');

      // Click to open note
      this.resultsBox.querySelectorAll('.search-result-item').forEach(el => {
        el.addEventListener('click', () => {
          const noteId = el.getAttribute('data-note-id');
          this.closeSearch();
          global.NoseerNavigation.navigateTo('editor', noteId);
        });
      });
    }

    escapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
  }

  global.NoseerSearch = new SearchController();
})(window);
