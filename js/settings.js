// Noseer Settings View Controller

(function(global) {
  class SettingsViewController {
    constructor() {
      this.init();
    }

    init() {
      this.chipsContainer = document.getElementById('settings-color-chips');
      this.themeToggle = document.getElementById('settings-toggle-theme');
      this.ottToggle = document.getElementById('settings-toggle-ott');
      this.ratioSelect = document.getElementById('settings-select-ratio');
      this.btnOpenPairing = document.getElementById('settings-btn-pairing');

      // Top device viewport switcher buttons
      document.querySelectorAll('.sim-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.sim-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const mode = btn.getAttribute('data-mode');
          this.setDeviceSimulation(mode);
        });
      });

      if (this.themeToggle) {
        this.themeToggle.addEventListener('change', (e) => {
          const newTheme = e.target.checked ? 'dark' : 'light';
          global.NoseerStore.updateSettings({ theme: newTheme });
        });
      }

      if (this.ottToggle) {
        this.ottToggle.addEventListener('change', (e) => {
          global.NoseerStore.updateSettings({ overTheTopAnimations: e.target.checked });
        });
      }

      if (this.ratioSelect) {
        this.ratioSelect.addEventListener('change', (e) => {
          const ratio = e.target.value;
          global.NoseerStore.updateSettings({ aspectRatio: ratio });
          if (global.NoseerCamera) global.NoseerCamera.setAspectRatio(ratio);
        });
      }

      if (this.btnOpenPairing) {
        this.btnOpenPairing.addEventListener('click', () => {
          if (global.NoseerSync) global.NoseerSync.openModal();
        });
      }

      this.aiModeSelect = document.getElementById('settings-ai-mode');
      this.geminiKeyInput = document.getElementById('settings-gemini-key');
      this.geminiKeyRow = document.getElementById('settings-gemini-key-row');

      if (this.aiModeSelect) {
        this.aiModeSelect.addEventListener('change', (e) => {
          const mode = e.target.value;
          global.NoseerStore.updateSettings({ aiMode: mode });
          if (this.geminiKeyRow) {
            this.geminiKeyRow.style.display = mode === 'gemini' ? 'flex' : 'none';
          }
        });
      }

      if (this.geminiKeyInput) {
        this.geminiKeyInput.addEventListener('input', (e) => {
          global.NoseerStore.updateSettings({ geminiApiKey: e.target.value.trim() });
        });
      }

      global.NoseerStore.subscribe((event) => {
        if (event === 'settings:changed') {
          this.render();
        }
      });
    }

    setDeviceSimulation(mode) {
      document.body.classList.remove('sim-mobile', 'sim-tablet', 'sim-desktop');
      if (mode === 'mobile') {
        document.body.classList.add('sim-mobile');
      } else {
        // Combined PC and Tablet into one identical mode
        document.body.classList.add('sim-tablet');
      }
      global.NoseerStore.updateSettings({ deviceViewport: mode });
      // Trigger editor re-render if active to toggle stylus tools & mobile view
      if (global.NoseerEditor && global.NoseerNavigation && global.NoseerNavigation.getActivePage() === 'editor') {
        global.NoseerEditor.renderContentPane();
      }
    }

    render() {
      const settings = global.NoseerStore.getSettings();

      if (this.themeToggle) {
        this.themeToggle.checked = (settings.theme !== 'light');
      }

      if (this.ottToggle) {
        this.ottToggle.checked = Boolean(settings.overTheTopAnimations);
      }

      if (this.ratioSelect) {
        this.ratioSelect.value = settings.aspectRatio || 'screen';
      }

      if (this.aiModeSelect) {
        this.aiModeSelect.value = settings.aiMode || 'smart';
        if (this.geminiKeyRow) {
          this.geminiKeyRow.style.display = settings.aiMode === 'gemini' ? 'flex' : 'none';
        }
      }

      if (this.geminiKeyInput) {
        this.geminiKeyInput.value = settings.geminiApiKey || '';
      }

      // Render accent color chips
      if (this.chipsContainer && global.NoseerTheme) {
        const presets = global.NoseerTheme.getPresets();
        this.chipsContainer.innerHTML = presets.map(p => `
          <button class="color-chip ${p.hex.toLowerCase() === settings.accentColor.toLowerCase() ? 'active' : ''}" 
                  style="background-color: ${p.hex};" 
                  data-hex="${p.hex}" 
                  title="${p.name}">
          </button>
        `).join('');

        this.chipsContainer.querySelectorAll('.color-chip').forEach(chip => {
          chip.addEventListener('click', () => {
            const hex = chip.getAttribute('data-hex');
            global.NoseerStore.updateSettings({ accentColor: hex });
          });
        });
      }
    }
  }

  global.NoseerSettings = new SettingsViewController();
})(window);
