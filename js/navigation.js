// Noseer Navigation Island & Screen Router

(function(global) {
  class NavigationController {
    constructor() {
      this.activePage = 'notes';
      this.init();
    }

    init() {
      this.islandWrapper = document.getElementById('nav-island-wrapper');
      this.btnNotes = document.getElementById('nav-btn-notes');
      this.btnCamera = document.getElementById('nav-btn-camera');
      this.btnGallery = document.getElementById('nav-btn-gallery');
      this.btnSearch = document.getElementById('nav-btn-search');

      if (this.btnNotes) this.btnNotes.addEventListener('click', () => this.navigateTo('notes'));
      if (this.btnCamera) this.btnCamera.addEventListener('click', () => this.navigateTo('camera'));
      if (this.btnGallery) this.btnGallery.addEventListener('click', () => this.navigateTo('gallery'));
      if (this.btnSearch) this.btnSearch.addEventListener('click', () => {
        if (global.NoseerSearch) global.NoseerSearch.openSearch();
      });

      // Keyboard shortcuts
      window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
        if (e.key === '1') this.navigateTo('notes');
        if (e.key === '2') this.navigateTo('camera');
        if (e.key === '3') this.navigateTo('gallery');
        if (e.key === '4') this.navigateTo('settings');
        if (e.key.toLowerCase() === 's' && this.activePage !== 'camera') {
          e.preventDefault();
          if (global.NoseerSearch) global.NoseerSearch.openSearch();
        }
      });
    }

    navigateTo(pageName, data = null) {
      this.activePage = pageName;
      document.body.setAttribute('data-active-page', pageName);

      // Update active view DOM
      document.querySelectorAll('.app-view').forEach(view => {
        view.classList.remove('active');
      });

      const targetView = document.getElementById(`view-${pageName}`);
      if (targetView) {
        targetView.classList.add('active');
      }

      // Update Island state
      if (this.islandWrapper) {
        if (pageName === 'camera') {
          this.islandWrapper.classList.add('on-camera');
        } else {
          this.islandWrapper.classList.remove('on-camera');
        }
      }

      // Update button active styling
      [this.btnNotes, this.btnCamera, this.btnGallery].forEach(btn => {
        if (btn) btn.classList.remove('active');
      });

      if (pageName === 'notes' && this.btnNotes) this.btnNotes.classList.add('active');
      if (pageName === 'camera' && this.btnCamera) this.btnCamera.classList.add('active');
      if (pageName === 'gallery' && this.btnGallery) this.btnGallery.classList.add('active');

      // Update top bar title
      const topTitle = document.getElementById('top-bar-title');
      if (topTitle && pageName !== 'editor') {
        const titleMap = {
          notes: 'Notes',
          camera: 'Camera',
          gallery: 'Gallery',
          settings: 'Settings'
        };
        topTitle.textContent = titleMap[pageName] || 'Notes';
      }

      // Trigger page-specific hooks
      if (pageName === 'notes' && global.NoseerNotes) {
        global.NoseerNotes.render();
      } else if (pageName === 'camera' && global.NoseerCamera) {
        global.NoseerCamera.startCamera();
      } else if (pageName === 'gallery' && global.NoseerGallery) {
        global.NoseerGallery.render();
      } else if (pageName === 'settings' && global.NoseerSettings) {
        global.NoseerSettings.render();
      } else if (pageName === 'editor' && global.NoseerEditor && data) {
        global.NoseerEditor.loadNote(data);
      }

      // Stop camera stream if navigating away from camera
      if (pageName !== 'camera' && global.NoseerCamera) {
        global.NoseerCamera.pauseCamera();
      }
    }

    getActivePage() {
      return this.activePage;
    }
  }

  global.NoseerNavigation = new NavigationController();
})(window);
