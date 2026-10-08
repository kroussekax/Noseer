// Noseer Notes Page Controller: 2-Level Hierarchy & 3D Sticker-Peel Animation

(function(global) {
  class NotesViewController {
    constructor() {
      this.currentLevel = 'categories'; // 'categories' | 'notebooks' | 'notes'
      this.selectedCategory = null;
      this.selectedNotebook = null;
      this.init();
    }

    init() {
      this.gridEl = document.getElementById('notes-content-grid');
      this.breadcrumbsEl = document.getElementById('notes-breadcrumbs');
      this.titleEl = document.getElementById('notes-page-title');

      global.NoseerStore.subscribe((event) => {
        if (event === 'notes:changed' && global.NoseerNavigation.getActivePage() === 'notes') {
          this.render();
        }
      });
    }

    render() {
      if (!this.gridEl) return;

      this.renderBreadcrumbs();

      if (this.currentLevel === 'categories') {
        this.renderCategories();
      } else if (this.currentLevel === 'notebooks') {
        this.renderNotebooks();
      } else if (this.currentLevel === 'notes') {
        this.renderNotesList();
      }
    }

    renderBreadcrumbs() {
      if (!this.breadcrumbsEl) return;

      let html = `<span class="breadcrumb-item ${this.currentLevel === 'categories' ? 'active' : ''}" data-nav="root">Notes</span>`;

      if (this.selectedCategory) {
        html += ` <span style="opacity: 0.5;">/</span> `;
        html += `<span class="breadcrumb-item ${this.currentLevel === 'notebooks' ? 'active' : ''}" data-nav="category">${this.escapeHtml(this.selectedCategory)}</span>`;
      }

      if (this.selectedNotebook) {
        html += ` <span style="opacity: 0.5;">/</span> `;
        html += `<span class="breadcrumb-item active" data-nav="notebook">${this.escapeHtml(this.selectedNotebook)}</span>`;
      }

      this.breadcrumbsEl.innerHTML = html;

      // Attach breadcrumbs click listeners
      this.breadcrumbsEl.querySelectorAll('.breadcrumb-item').forEach(item => {
        item.addEventListener('click', () => {
          const nav = item.getAttribute('data-nav');
          if (nav === 'root') {
            this.currentLevel = 'categories';
            this.selectedCategory = null;
            this.selectedNotebook = null;
            this.render();
          } else if (nav === 'category') {
            this.currentLevel = 'notebooks';
            this.selectedNotebook = null;
            this.render();
          }
        });
      });
    }

    // --- 1. Top Level: Categories Grid ---
    renderCategories() {
      if (this.titleEl) this.titleEl.textContent = 'Categories';
      const categories = global.NoseerStore.getCategories();

      const getCategoryIcon = (name) => {
        if (name === 'Whiteboard') return '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20 3H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h4v2h8v-2h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12H4V5h16v10z"/></svg>';
        if (name === 'Notebook') return '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 18h12v-2H3v2zM3 6v2h18V6H3zm0 7h18v-2H3v2z"/></svg>';
        if (name === 'Bills') return '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 14V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-9-1c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-6v11c0 1.1-.9 2-2 2H4v-2h17V7h2z"/></svg>';
        if (name === 'Documents') return '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>';
        return '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>';
      };

      this.gridEl.innerHTML = categories.map(cat => `
        <div class="category-card sticker-peelable" data-category="${this.escapeHtml(cat.name)}">
          <div class="category-card-top">
            <div class="category-icon-box">
              ${getCategoryIcon(cat.name)}
            </div>
            <span class="category-badge">${cat.count} ${cat.count === 1 ? 'note' : 'notes'}</span>
          </div>
          <div class="category-info">
            <div class="category-name">${this.escapeHtml(cat.name)}</div>
            <div class="category-meta">${cat.notebooks.length} ${cat.notebooks.length === 1 ? 'notebook' : 'notebooks'}</div>
          </div>
        </div>
      `).join('');

      // Attach sticker peel click
      this.gridEl.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
          const categoryName = card.getAttribute('data-category');
          this.triggerPeelAnimation(card, () => {
            this.selectedCategory = categoryName;
            this.currentLevel = 'notebooks';
            this.render();
          });
        });
      });
    }

    // --- 2. Second Level: Notebooks Grid ---
    renderNotebooks() {
      if (this.titleEl) this.titleEl.textContent = `${this.selectedCategory} Notebooks`;
      const notebooks = global.NoseerStore.getNotebooks(this.selectedCategory);

      if (notebooks.length === 0) {
        this.gridEl.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--md-text-muted);">
            No notebooks found in this category yet.
          </div>
        `;
        return;
      }

      this.gridEl.innerHTML = notebooks.map(nb => `
        <div class="notebook-card sticker-peelable" data-notebook="${this.escapeHtml(nb.name)}">
          <div class="category-card-top">
            <div class="category-icon-box">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
              </svg>
            </div>
            <span class="category-badge">${nb.count} ${nb.count === 1 ? 'note' : 'notes'}</span>
          </div>
          <div class="category-info">
            <div class="notebook-name">${this.escapeHtml(nb.name)}</div>
            <div class="category-meta">Recent: ${this.escapeHtml(nb.recent ? nb.recent.title : 'None')}</div>
          </div>
        </div>
      `).join('');

      // Attach sticker peel click
      this.gridEl.querySelectorAll('.notebook-card').forEach(card => {
        card.addEventListener('click', () => {
          const nbName = card.getAttribute('data-notebook');
          this.triggerPeelAnimation(card, () => {
            this.selectedNotebook = nbName;
            this.currentLevel = 'notes';
            this.render();
          });
        });
      });
    }

    // --- 3. Third Level / Direct Notes List ---
    renderNotesList() {
      const notes = global.NoseerStore.getNotes();

      if (notes.length === 0) {
        this.gridEl.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--md-text-muted);">
            <div style="font-size: 16px; font-weight: 600; color: var(--md-text-primary); margin-bottom: 6px;">No notes yet</div>
            <div>Snap a photo with the camera to run on-device OCR and extract notes!</div>
          </div>
        `;
        return;
      }

      this.gridEl.innerHTML = notes.map(note => {
        const hasGraphic = Boolean(note.svgGraphic || note.imageUri);
        const dateStr = note.createdAt || note.date || '';

        return `
          <div class="asym-card-container ${hasGraphic ? 'has-graphic' : 'no-graphic'} sticker-peelable" data-note-id="${note.id}">
            ${hasGraphic ? `
              <div class="asym-card-top">
                ${note.svgGraphic ? note.svgGraphic : `<img src="${note.imageUri}" alt="${this.escapeHtml(note.title)}" />`}
              </div>
              <div class="asym-card-bottom half-width">
                <div class="asym-card-title">${this.escapeHtml(note.title)}</div>
                <div class="asym-card-date">${this.escapeHtml(dateStr)}</div>
              </div>
            ` : `
              <div class="asym-card-bottom full-width">
                <div class="asym-card-title">${this.escapeHtml(note.title)}</div>
                <div class="asym-card-date">${this.escapeHtml(dateStr)}</div>
              </div>
            `}
          </div>
        `;
      }).join('');

      this.gridEl.querySelectorAll('.asym-card-container').forEach(card => {
        card.addEventListener('click', () => {
          const noteId = card.getAttribute('data-note-id');
          this.triggerPeelAnimation(card, () => {
            global.NoseerNavigation.navigateTo('editor', noteId);
          });
        });
      });
    }

    // 3D Sticker-Peeling Animation Handler
    triggerPeelAnimation(element, callback) {
      const isOverTheTop = global.NoseerStore.getSettings().overTheTopAnimations;
      if (!isOverTheTop) {
        // Quick clean transition
        element.style.opacity = '0.5';
        setTimeout(callback, 80);
        return;
      }

      // Add realistic 3D corner peel
      element.classList.add('sticker-peeling');
      setTimeout(() => {
        element.classList.remove('sticker-peeling');
        callback();
      }, 480);
    }

    escapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
  }

  global.NoseerNotes = new NotesViewController();
})(window);
