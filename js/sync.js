// Noseer Temporary QR-Based Device Session Synchronization

(function(global) {
  class SyncController {
    constructor() {
      this.init();
    }

    init() {
      this.modal = document.getElementById('qr-sync-modal');
      this.canvas = document.getElementById('qr-canvas');
      this.tokenEl = document.getElementById('qr-session-token');
      this.statusEl = document.getElementById('qr-session-status');
      this.btnConnectSim = document.getElementById('btn-qr-simulate-scan');
      this.btnTransferNote = document.getElementById('btn-qr-transfer');
      this.btnDisconnect = document.getElementById('btn-qr-disconnect');
      this.btnClose = document.getElementById('btn-qr-close');
      this.topIndicator = document.getElementById('top-session-indicator');

      if (this.btnClose) {
        this.btnClose.addEventListener('click', () => this.closeModal());
      }

      if (this.modal) {
        this.modal.addEventListener('click', (e) => {
          if (e.target === this.modal) this.closeModal();
        });
      }

      if (this.topIndicator) {
        this.topIndicator.addEventListener('click', () => this.openModal());
      }

      if (this.btnConnectSim) {
        this.btnConnectSim.addEventListener('click', () => {
          global.NoseerStore.setSessionPaired('Pixel 9 Pro Mobile');
          this.render();
        });
      }

      if (this.btnTransferNote) {
        this.btnTransferNote.addEventListener('click', () => {
          const notes = global.NoseerStore.getNotes();
          const recentNote = notes[0];
          if (recentNote) {
            global.NoseerStore.addNotification({
              title: 'Note Transferred to Mobile',
              message: `"${recentNote.title}" synced to paired mobile session.`,
              type: 'sync'
            });
            alert(`✓ "${recentNote.title}" successfully transferred to paired mobile device!`);
          }
        });
      }

      if (this.btnDisconnect) {
        this.btnDisconnect.addEventListener('click', () => {
          global.NoseerStore.disconnectSession();
          this.render();
        });
      }

      // Automatically expire session when window/tab is closed
      window.addEventListener('beforeunload', () => {
        global.NoseerStore.disconnectSession();
      });

      // Update top indicator on session changes
      global.NoseerStore.subscribe((event) => {
        if (event === 'session:changed') {
          this.updateTopIndicator();
          this.render();
        }
      });

      this.updateTopIndicator();
    }

    openModal() {
      if (!this.modal) return;
      this.render();
      this.modal.classList.add('active');
    }

    closeModal() {
      if (this.modal) this.modal.classList.remove('active');
    }

    updateTopIndicator() {
      const session = global.NoseerStore.getSession();
      if (!this.topIndicator) return;

      if (session.paired) {
        this.topIndicator.innerHTML = `
          <span style="width: 6px; height: 6px; border-radius: 50%; background: #10b981;"></span>
          <span>Paired: ${session.device}</span>
        `;
      } else {
        this.topIndicator.innerHTML = `
          <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--md-accent-primary);"></span>
          <span>QR Pair: ${session.id}</span>
        `;
      }
    }

    render() {
      const session = global.NoseerStore.getSession();

      if (this.tokenEl) {
        this.tokenEl.textContent = `Session: ${session.id}`;
      }

      // Generate QR Code with session pairing URL payload
      if (this.canvas && global.QRCodeGenerator) {
        // Use LAN IP so phone camera can immediately open the URL
        const lanHost = (window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
          ? window.location.host
          : '192.168.1.107:8080';
        const payload = `http://${lanHost}/?session=${session.id}`;
        
        global.QRCodeGenerator.renderCanvas(this.canvas, payload, {
          size: 190,
          dark: '#0f172a',
          light: '#ffffff'
        });
      }

      // Check if current page was opened from a scanned session link
      const urlParams = new URLSearchParams(window.location.search);
      const urlSession = urlParams.get('session');
      if (urlSession && !this.handledUrlSession) {
        this.handledUrlSession = true;
        global.NoseerStore.setSessionPaired('Mobile Device (' + (navigator.userAgent.includes('Android') ? 'Android' : (navigator.userAgent.includes('iPhone') ? 'iPhone' : 'Mobile Web')) + ')');
      }

      if (this.statusEl) {
        if (session.paired) {
          this.statusEl.innerHTML = `
            <span style="color: #10b981; font-weight: 700;">● Connected</span>
            <span>with ${session.device} (Active for this tab session only)</span>
          `;
          if (this.btnConnectSim) this.btnConnectSim.style.display = 'none';
          if (this.btnTransferNote) this.btnTransferNote.style.display = 'block';
          if (this.btnDisconnect) this.btnDisconnect.style.display = 'block';
        } else {
          const lanHost = (window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
            ? window.location.host
            : '192.168.1.107:8080';
          this.statusEl.innerHTML = `
            <div style="font-size: 13px; font-weight: 600; color: var(--md-accent-primary);">http://${lanHost}</div>
            <div style="color: var(--md-text-muted); font-size: 11px;">Point your phone camera at the QR code above or type the link into your mobile browser</div>
          `;
          if (this.btnConnectSim) this.btnConnectSim.style.display = 'block';
          if (this.btnTransferNote) this.btnTransferNote.style.display = 'none';
          if (this.btnDisconnect) this.btnDisconnect.style.display = 'none';
        }
      }
    }
  }

  global.NoseerSync = new SyncController();
})(window);
