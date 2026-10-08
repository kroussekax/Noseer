// Noseer Gallery Controller: Raw Captured Images, Sorting & Reprocessing

(function(global) {
  class GalleryViewController {
    constructor() {
      this.sortOrder = 'newest';
      this.selectedItem = null;
      this.init();
    }

    init() {
      this.gridEl = document.getElementById('gallery-content-grid');
      this.sortSelect = document.getElementById('gallery-sort-select');
      this.countEl = document.getElementById('gallery-item-count');
      this.modal = document.getElementById('gallery-detail-modal');
      this.modalImg = document.getElementById('gallery-modal-img');
      this.modalTitle = document.getElementById('gallery-modal-title');
      this.modalMeta = document.getElementById('gallery-modal-meta');
      this.btnOpenNote = document.getElementById('gallery-btn-open-note');
      this.btnReprocess = document.getElementById('gallery-btn-reprocess');
      this.btnDelete = document.getElementById('gallery-btn-delete');
      this.btnCloseModal = document.getElementById('gallery-btn-close-modal');

      if (this.sortSelect) {
        this.sortSelect.addEventListener('change', (e) => {
          this.sortOrder = e.target.value;
          this.render();
        });
      }

      if (this.btnCloseModal) {
        this.btnCloseModal.addEventListener('click', () => this.closeModal());
      }

      if (this.modal) {
        this.modal.addEventListener('click', (e) => {
          if (e.target === this.modal) this.closeModal();
        });
      }

      if (this.btnOpenNote) {
        this.btnOpenNote.addEventListener('click', () => {
          if (this.selectedItem && this.selectedItem.noteId) {
            this.closeModal();
            global.NoseerNavigation.navigateTo('editor', this.selectedItem.noteId);
          }
        });
      }

      if (this.btnReprocess) {
        this.btnReprocess.addEventListener('click', () => {
          if (this.selectedItem) {
            const item = this.selectedItem;
            this.closeModal();
            if (global.NoseerPipeline) {
              global.NoseerPipeline.processImage(item.imageUri, item.category || 'Whiteboard');
            }
          }
        });
      }

      if (this.btnDelete) {
        this.btnDelete.addEventListener('click', () => {
          if (this.selectedItem && confirm('Delete this captured photograph?')) {
            global.NoseerStore.deleteGalleryItem(this.selectedItem.id);
            this.closeModal();
          }
        });
      }

      global.NoseerStore.subscribe((event) => {
        if (event === 'gallery:changed' && global.NoseerNavigation.getActivePage() === 'gallery') {
          this.render();
        }
      });
    }

    render() {
      if (!this.gridEl) return;

      const items = global.NoseerStore.getGallery(this.sortOrder);
      if (this.countEl) {
        this.countEl.textContent = `${items.length} ${items.length === 1 ? 'image' : 'images'}`;
      }

      if (items.length === 0) {
        this.gridEl.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--md-text-muted);">
            <div style="font-size: 16px; font-weight: 600; color: var(--md-text-primary); margin-bottom: 6px;">No gallery items</div>
            <div>Photos taken with the camera will appear here.</div>
          </div>
        `;
        return;
      }

      this.gridEl.innerHTML = items.map(item => `
        <div class="asym-card-container has-graphic gallery-card" data-id="${item.id}">
          <div class="asym-card-top">
            <img src="${item.imageUri}" alt="${this.escapeHtml(item.title)}" loading="lazy" />
          </div>
          <div class="asym-card-bottom half-width">
            <div class="asym-card-date">${this.escapeHtml(item.capturedAt || item.date || '')}</div>
          </div>
        </div>
      `).join('');

      this.gridEl.querySelectorAll('.asym-card-container').forEach(card => {
        card.addEventListener('click', () => {
          const id = card.getAttribute('data-id');
          this.openModal(id);
        });
      });
    }

    openModal(id) {
      const items = global.NoseerStore.getGallery();
      this.selectedItem = items.find(i => i.id === id);
      if (!this.selectedItem || !this.modal) return;

      if (this.modalImg) this.modalImg.src = this.selectedItem.imageUri;
      if (this.modalTitle) this.modalTitle.textContent = this.selectedItem.title || 'Captured Image';
      if (this.modalMeta) {
        const linkedNote = global.NoseerStore.getNote(this.selectedItem.noteId);
        this.modalMeta.textContent = `Captured: ${this.selectedItem.capturedAt || 'Recent'} • Category: ${this.selectedItem.category || 'General'} • Linked Note: ${linkedNote ? linkedNote.title : 'None'}`;
      }

      this.modal.classList.add('active');
      document.body.setAttribute('data-gallery-modal', 'true');
    }

    closeModal() {
      if (this.modal) this.modal.classList.remove('active');
      this.selectedItem = null;
      document.body.removeAttribute('data-gallery-modal');
    }

    escapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
  }

  global.NoseerGallery = new GalleryViewController();
})(window);
