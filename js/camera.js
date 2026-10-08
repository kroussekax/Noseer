// Noseer Camera Controller: WebRTC, Aspect Ratio Matte, and Capture

(function(global) {
  class CameraController {
    constructor() {
      this.stream = null;
      this.videoEl = null;
      this.previewBox = null;
      this.currentRatio = 'screen';
      this.facingMode = 'environment';
      this.currentPresetIndex = 0;
      this.presets = [
        { name: 'Whiteboard Demo', type: 'Whiteboard', getSvg: () => global.NoseerStore.helpers.createWhiteboardSvg() },
        { name: 'Notebook Demo', type: 'Notebook', getSvg: () => global.NoseerStore.helpers.createNotebookSvg() },
        { name: 'Bill Receipt Demo', type: 'Bills', getSvg: () => global.NoseerStore.helpers.createReceiptSvg() },
        { name: 'Document Demo', type: 'Documents', getSvg: () => global.NoseerStore.helpers.createDocumentSvg() }
      ];
      this.init();
    }

    init() {
      this.videoEl = document.getElementById('camera-video');
      this.fallbackImg = document.getElementById('camera-fallback-img');
      this.previewBox = document.getElementById('camera-preview-box');
      this.flashOverlay = document.getElementById('camera-flash-overlay');
      this.captureBtn = document.getElementById('camera-capture-btn');
      this.btnRatioToggle = document.getElementById('btn-camera-ratio');
      this.btnPresets = document.getElementById('btn-camera-presets');
      this.presetsPopup = document.getElementById('camera-presets-popup');
      this.fileInput = document.getElementById('camera-file-upload');

      // Initialize Aspect Ratio from settings
      const settings = global.NoseerStore.getSettings();
      this.setAspectRatio(settings.aspectRatio || 'screen');

      // Capture button trigger
      if (this.captureBtn) {
        this.captureBtn.addEventListener('click', () => this.capture());
      }

      // Aspect Ratio cycling
      if (this.btnRatioToggle) {
        this.btnRatioToggle.addEventListener('click', () => {
          const ratios = ['screen', '4:3', '16:9', '1:1'];
          const nextIdx = (ratios.indexOf(this.currentRatio) + 1) % ratios.length;
          this.setAspectRatio(ratios[nextIdx]);
          global.NoseerStore.updateSettings({ aspectRatio: this.currentRatio });
        });
      }

      // Presets menu trigger
      if (this.btnPresets) {
        this.btnPresets.addEventListener('click', (e) => {
          e.stopPropagation();
          this.presetsPopup.classList.toggle('active');
        });
      }

      // Handle preset selection
      document.querySelectorAll('.preset-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
          const type = chip.getAttribute('data-preset');
          this.loadPresetType(type);
          this.presetsPopup.classList.remove('active');
        });
      });

      // Close preset popup on outside click
      window.addEventListener('click', (e) => {
        if (this.presetsPopup && !this.presetsPopup.contains(e.target) && e.target !== this.btnPresets) {
          this.presetsPopup.classList.remove('active');
        }
      });

      // Custom file upload support
      if (this.fileInput) {
        this.fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
              this.showImageFallback(evt.target.result);
              this.activeCustomImage = evt.target.result;
            };
            reader.readAsDataURL(file);
          }
        });
      }

      // Show initial fallback view until live stream starts
      this.loadPresetType('Whiteboard');
    }

    setAspectRatio(ratio) {
      this.currentRatio = ratio;
      if (!this.previewBox) return;

      this.previewBox.className = 'camera-preview-box';
      if (ratio === 'screen') {
        this.previewBox.classList.add('ratio-screen');
        if (this.btnRatioToggle) this.btnRatioToggle.textContent = 'Ratio: Screen';
      } else if (ratio === '4:3') {
        this.previewBox.classList.add('ratio-4-3');
        if (this.btnRatioToggle) this.btnRatioToggle.textContent = 'Ratio: 4:3';
      } else if (ratio === '16:9') {
        this.previewBox.classList.add('ratio-16-9');
        if (this.btnRatioToggle) this.btnRatioToggle.textContent = 'Ratio: 16:9';
      } else if (ratio === '1:1') {
        this.previewBox.classList.add('ratio-1-1');
        if (this.btnRatioToggle) this.btnRatioToggle.textContent = 'Ratio: 1:1';
      }
    }

    async startCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log('WebRTC Camera not supported, using interactive presets view.');
        return;
      }

      try {
        if (this.stream) return; // Already running
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: this.facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });

        this.stream = stream;
        if (this.videoEl) {
          this.videoEl.srcObject = stream;
          this.videoEl.style.display = 'block';
          if (this.fallbackImg) this.fallbackImg.style.display = 'none';
          await this.videoEl.play();
        }
      } catch (err) {
        console.info('Live camera unavailable or denied, running in high-fidelity preview mode:', err.message);
        this.pauseCamera();
      }
    }

    pauseCamera() {
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }
      if (this.videoEl) {
        this.videoEl.style.display = 'none';
        this.videoEl.srcObject = null;
      }
      if (this.fallbackImg) {
        this.fallbackImg.style.display = 'block';
      }
    }

    loadPresetType(type) {
      this.selectedPresetType = type || 'Notes';
      const svg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
        <rect width="600" height="400" fill="%230f172a" stroke="%23334155" stroke-width="4"/>
        <rect x="20" y="20" width="560" height="360" fill="%231e293b" rx="8"/>
        <text x="40" y="65" font-family="sans-serif" font-size="22" font-weight="bold" fill="%230284c7">Bill on Mond.</text>
        <line x1="40" y1="80" x2="220" y2="80" stroke="%230284c7" stroke-width="2"/>
        <text x="40" y="125" font-family="monospace" font-size="16" fill="%23ef4444">Spaghetti ... $14.50</text>
        <text x="40" y="160" font-family="monospace" font-size="16" fill="%23ef4444">Sodas ... $6.50</text>
        <text x="40" y="195" font-family="monospace" font-size="16" fill="%23ef4444">Beer ... $8.00</text>
        <!-- Graph axes and bars -->
        <line x1="40" y1="340" x2="300" y2="340" stroke="%2394a3b8" stroke-width="2"/>
        <line x1="40" y1="220" x2="40" y2="340" stroke="%2394a3b8" stroke-width="2"/>
        <rect x="70" y="270" width="30" height="70" fill="%23ef4444" />
        <rect x="130" y="240" width="30" height="100" fill="%23ef4444" />
        <rect x="190" y="260" width="30" height="80" fill="%23ef4444" />
        <text x="280" y="355" font-family="sans-serif" font-size="12" fill="%2394a3b8">item</text>
      </svg>`;

      this.activeCustomImage = svg;
      this.showImageFallback(svg);
    }

    showImageFallback(src) {
      if (this.videoEl) this.videoEl.style.display = 'none';
      if (this.fallbackImg) {
        this.fallbackImg.src = src;
        this.fallbackImg.style.display = 'block';
      }
    }

    capture() {
      // Trigger shutter flash
      if (this.flashOverlay) {
        this.flashOverlay.classList.remove('flashing');
        void this.flashOverlay.offsetWidth; // trigger reflow
        this.flashOverlay.classList.add('flashing');
      }

      let capturedDataUrl = this.activeCustomImage;

      // If video stream is active, capture actual frame to canvas
      if (this.videoEl && this.videoEl.style.display !== 'none' && this.videoEl.videoWidth > 0) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = this.videoEl.videoWidth;
          canvas.height = this.videoEl.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(this.videoEl, 0, 0, canvas.width, canvas.height);
          capturedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        } catch (e) {
          console.warn('Canvas capture fallback:', e);
        }
      }

      // Hand off to AI Processing Pipeline!
      if (global.NoseerPipeline) {
        global.NoseerPipeline.processImage(capturedDataUrl, this.selectedPresetType || 'Whiteboard');
      }
    }
  }

  global.NoseerCamera = new CameraController();
})(window);
