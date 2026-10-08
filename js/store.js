// Noseer Application State Store & Sample Data

(function(global) {
  const STORAGE_KEYS = {
    NOTES: 'noseer_notes_v1',
    GALLERY: 'noseer_gallery_v1',
    SETTINGS: 'noseer_settings_v1',
    NOTIFS: 'noseer_notifications_v1',
    SESSION: 'noseer_session_v1'
  };

  // Helper to generate SVG Data URLs for realistic mock captures
  function createWhiteboardSvg() {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <rect width="600" height="400" fill="%23f1f5f9" stroke="%2394a3b8" stroke-width="8"/>
      <rect x="20" y="20" width="560" height="360" fill="%23ffffff" rx="4"/>
      <text x="40" y="60" font-family="sans-serif" font-size="22" font-weight="bold" fill="%230284c7">PHYS 401: Quantum Wavefunctions</text>
      <line x1="40" y1="75" x2="420" y2="75" stroke="%230284c7" stroke-width="2"/>
      <text x="40" y="115" font-family="serif" font-size="24" fill="%230f172a">Ĥψ(x) = Eψ(x)</text>
      <text x="40" y="150" font-family="serif" font-size="18" fill="%23334155">where Ĥ = - (ℏ² / 2m) d²/dx² + V(x)</text>
      <path d="M 50 310 Q 150 180, 250 310 T 450 310" fill="none" stroke="%23dc2626" stroke-width="3"/>
      <line x1="40" y1="310" x2="520" y2="310" stroke="%2364748b" stroke-width="1.5" stroke-dasharray="4"/>
      <text x="470" y="305" font-family="sans-serif" font-size="14" fill="%2364748b">V=0</text>
      <text x="50" y="345" font-family="sans-serif" font-size="15" fill="%2316a34a">✓ Boundary: ψ(0) = ψ(L) = 0</text>
      <text x="50" y="370" font-family="sans-serif" font-size="15" fill="%2316a34a">✓ Quantized energy En = n²π²ℏ² / (2mL²)</text>
    </svg>`;
  }

  function createNotebookSvg() {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <rect width="600" height="400" fill="%23fefce8" stroke="%23cbd5e1" stroke-width="2"/>
      <line x1="70" y1="0" x2="70" y2="400" stroke="%23fda4af" stroke-width="2"/>
      ${Array.from({length: 12}, (_, i) => `<line x1="0" y1="${50 + i * 28}" x2="600" y2="${50 + i * 28}" stroke="%23e2e8f0" stroke-width="1"/>`).join('')}
      <text x="90" y="70" font-family="cursive, sans-serif" font-size="20" font-weight="bold" fill="%231e293b">Lecture 14: Surface Flux &amp; Divergence</text>
      <text x="90" y="102" font-family="cursive, serif" font-size="18" fill="%232563eb">∬_S F · dS = ∭_E div(F) dV</text>
      <text x="90" y="130" font-family="cursive, sans-serif" font-size="15" fill="%23334155">Let F(x,y,z) = ⟨2x, 3y, z²⟩ over cylinder x²+y² ≤ 4</text>
      <text x="90" y="158" font-family="cursive, sans-serif" font-size="15" fill="%23475569">1) div F = ∂(2x)/∂x + ∂(3y)/∂y + ∂(z²)/∂z = 2 + 3 + 2z = 5 + 2z</text>
      <text x="90" y="186" font-family="cursive, sans-serif" font-size="15" fill="%23475569">2) In cylindrical coordinates: r ∈ [0,2], θ ∈ [0,2π], z ∈ [0,3]</text>
      <text x="90" y="214" font-family="cursive, sans-serif" font-size="15" fill="%2315803d">Result: Flux = 60π</text>
      <circle cx="500" cy="290" r="45" fill="none" stroke="%230284c7" stroke-width="2"/>
      <ellipse cx="500" cy="335" rx="45" ry="12" fill="none" stroke="%230284c7" stroke-width="1.5" stroke-dasharray="3"/>
      <ellipse cx="500" cy="245" rx="45" ry="12" fill="none" stroke="%230284c7" stroke-width="1.5"/>
    </svg>`;
  }

  function createReceiptSvg() {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 550" width="100%" height="100%">
      <rect width="400" height="550" fill="%23fafaf9" stroke="%23e7e5e4" stroke-width="2"/>
      <text x="200" y="45" text-anchor="middle" font-family="monospace" font-size="18" font-weight="bold" fill="%231c1917">URBAN BISTRO &amp; CAFE</text>
      <text x="200" y="68" text-anchor="middle" font-family="monospace" font-size="12" fill="%2378716c">104 Grand Avenue, Suite 2</text>
      <text x="200" y="85" text-anchor="middle" font-family="monospace" font-size="12" fill="%2378716c">2026-09-14 19:42 | Table 14</text>
      <line x1="30" y1="100" x2="370" y2="100" stroke="%23a8a29e" stroke-width="1" stroke-dasharray="4"/>
      <text x="40" y="130" font-family="monospace" font-size="14" fill="%23292524">1x Truffle Wild Rice</text>
      <text x="360" y="130" text-anchor="end" font-family="monospace" font-size="14" fill="%23292524">$14.50</text>
      <text x="40" y="160" font-family="monospace" font-size="14" fill="%23292524">1x Roasted Herb Chicken</text>
      <text x="360" y="160" text-anchor="end" font-family="monospace" font-size="14" fill="%23292524">$26.00</text>
      <text x="40" y="190" font-family="monospace" font-size="14" fill="%23292524">2x Sparkling Lemonade</text>
      <text x="360" y="190" text-anchor="end" font-family="monospace" font-size="14" fill="%23292524">$13.00</text>
      <line x1="30" y1="220" x2="370" y2="220" stroke="%23d6d3d1" stroke-width="1"/>
      <text x="40" y="245" font-family="monospace" font-size="14" fill="%2357534e">Food Subtotal:</text>
      <text x="360" y="245" text-anchor="end" font-family="monospace" font-size="14" fill="%2357534e">$53.50</text>
      <text x="40" y="270" font-family="monospace" font-size="14" fill="%2357534e">State Tax (9.5%):</text>
      <text x="360" y="270" text-anchor="end" font-family="monospace" font-size="14" fill="%2357534e">$6.80</text>
      <text x="40" y="295" font-family="monospace" font-size="14" fill="%2357534e">Service Fee:</text>
      <text x="360" y="295" text-anchor="end" font-family="monospace" font-size="14" fill="%2357534e">$4.20</text>
      <text x="40" y="320" font-family="monospace" font-size="14" fill="%2357534e">Staff Tip (20%):</text>
      <text x="360" y="320" text-anchor="end" font-family="monospace" font-size="14" fill="%2357534e">$20.00</text>
      <line x1="30" y1="345" x2="370" y2="345" stroke="%23a8a29e" stroke-width="1.5"/>
      <text x="40" y="380" font-family="monospace" font-size="18" font-weight="bold" fill="%230c0a09">TOTAL USD:</text>
      <text x="360" y="380" text-anchor="end" font-family="monospace" font-size="20" font-weight="bold" fill="%230c0a09">$84.50</text>
      <text x="200" y="440" text-anchor="middle" font-family="monospace" font-size="12" fill="%2378716c">PAID - VISA CONTACTLESS *4821</text>
      <text x="200" y="465" text-anchor="middle" font-family="monospace" font-size="13" font-weight="bold" fill="%2315803d">THANK YOU FOR DINING WITH US!</text>
    </svg>`;
  }

  function createDocumentSvg() {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" width="100%" height="100%">
      <rect width="500" height="400" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="2"/>
      <text x="50" y="55" font-family="serif" font-size="18" font-weight="bold" fill="%230f172a">RESEARCH GRANT AGREEMENT #2026-NEUR</text>
      <line x1="50" y1="70" x2="450" y2="70" stroke="%230f172a" stroke-width="1.5"/>
      <text x="50" y="105" font-family="serif" font-size="13" fill="%23334155">Section 4.1: Open Science &amp; Publication Rights</text>
      <text x="50" y="130" font-family="serif" font-size="11" fill="%23475569">The Principal Investigator covenants to publish raw sensory capture data</text>
      <text x="50" y="150" font-family="serif" font-size="11" fill="%23475569">under Creative Commons 4.0 within 60 days of experiment closure.</text>
      <text x="50" y="185" font-family="serif" font-size="13" fill="%23334155">Section 4.2: Equipment Allocation</text>
      <text x="50" y="210" font-family="serif" font-size="11" fill="%23475569">Budget approved: $120,000 for optical sensors and mobile test units.</text>
      <rect x="50" y="280" width="160" height="50" fill="%23f8fafc" stroke="%23cbd5e1"/>
      <text x="60" y="300" font-family="cursive" font-size="16" fill="%231d4ed8">Dr. A. Vance</text>
      <text x="60" y="322" font-family="sans-serif" font-size="10" fill="%2364748b">Verified Signature - 2026-09-02</text>
    </svg>`;
  }

  // Initial empty data structures (no dummy/temporary data)
  const DEFAULT_NOTES = [];
  const DEFAULT_GALLERY = [];

  // Initial Notifications
  const DEFAULT_NOTIFICATIONS = [
    {
      id: 'notif-1',
      title: 'Welcome to Noseer',
      message: 'Tap the camera button to snap any board, notebook, or receipt for on-device OCR and vector graph extraction.',
      time: 'Just now',
      type: 'hint',
      read: false
    }
  ];

  // Initial Settings
  const DEFAULT_SETTINGS = {
    accentColor: '#0284c7', // Minimalist Slate-Cyan Material accent
    theme: 'dark',          // 'dark' or 'light'
    aspectRatio: 'screen',  // 'screen', '4:3', '16:9', '1:1'
    overTheTopAnimations: true,
    deviceViewport: 'responsive' // 'responsive', 'mobile', 'tablet', 'desktop'
  };

  class Store {
    constructor() {
      this.listeners = [];
      this.init();
    }

    init() {
      this.notes = this.load(STORAGE_KEYS.NOTES, DEFAULT_NOTES);
      this.gallery = this.load(STORAGE_KEYS.GALLERY, DEFAULT_GALLERY);
      this.settings = this.load(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      this.notifications = this.load(STORAGE_KEYS.NOTIFS, DEFAULT_NOTIFICATIONS);
      this.session = {
        id: 'NS-' + Math.floor(1000 + Math.random() * 9000),
        paired: false,
        device: null,
        startedAt: Date.now()
      };
    }

    load(key, fallback) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.warn('LocalStorage access warning:', e);
      }
      return JSON.parse(JSON.stringify(fallback));
    }

    save(key, val) {
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch (e) {
        console.warn('LocalStorage save warning:', e);
      }
    }

    subscribe(fn) {
      this.listeners.push(fn);
      return () => {
        this.listeners = this.listeners.filter(l => l !== fn);
      };
    }

    notify(event, data) {
      this.listeners.forEach(fn => fn(event, data));
    }

    // --- Notes API ---
    getNotes() {
      return this.notes;
    }

    getNote(id) {
      return this.notes.find(n => n.id === id);
    }

    saveNote(note) {
      const idx = this.notes.findIndex(n => n.id === note.id);
      if (idx >= 0) {
        this.notes[idx] = { ...this.notes[idx], ...note, updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16) };
      } else {
        this.notes.unshift(note);
      }
      this.save(STORAGE_KEYS.NOTES, this.notes);
      this.notify('notes:changed', this.notes);
      return note;
    }

    deleteNote(id) {
      this.notes = this.notes.filter(n => n.id !== id);
      this.save(STORAGE_KEYS.NOTES, this.notes);
      this.notify('notes:changed', this.notes);
    }

    // Categories and Notebooks breakdown
    getCategories() {
      const categories = ['Whiteboard', 'Notebook', 'Bills', 'Documents', 'Miscellaneous'];
      return categories.map(cat => {
        const catNotes = this.notes.filter(n => n.category === cat);
        const notebooks = [...new Set(catNotes.map(n => n.notebook || 'General'))];
        return {
          name: cat,
          count: catNotes.length,
          notebooks: notebooks,
          recent: catNotes[0]
        };
      });
    }

    getNotebooks(category) {
      const catNotes = this.notes.filter(n => n.category === category);
      const groups = {};
      catNotes.forEach(note => {
        const nb = note.notebook || 'General';
        if (!groups[nb]) groups[nb] = [];
        groups[nb].push(note);
      });
      return Object.keys(groups).map(nb => ({
        name: nb,
        notes: groups[nb],
        count: groups[nb].length,
        recent: groups[nb][0]
      }));
    }

    // --- Gallery API ---
    getGallery(sortOrder = 'newest') {
      const list = [...this.gallery];
      if (sortOrder === 'newest') {
        list.sort((a, b) => new Date(b.capturedAt) - new Date(a.capturedAt));
      } else {
        list.sort((a, b) => new Date(a.capturedAt) - new Date(b.capturedAt));
      }
      return list;
    }

    addGalleryItem(item) {
      this.gallery.unshift(item);
      this.save(STORAGE_KEYS.GALLERY, this.gallery);
      this.notify('gallery:changed', this.gallery);
      return item;
    }

    deleteGalleryItem(id) {
      this.gallery = this.gallery.filter(g => g.id !== id);
      this.save(STORAGE_KEYS.GALLERY, this.gallery);
      this.notify('gallery:changed', this.gallery);
    }

    // --- Settings API ---
    getSettings() {
      return this.settings;
    }

    updateSettings(partial) {
      this.settings = { ...this.settings, ...partial };
      this.save(STORAGE_KEYS.SETTINGS, this.settings);
      this.notify('settings:changed', this.settings);
    }

    // --- Notifications API ---
    getNotifications() {
      return this.notifications;
    }

    getUnreadCount() {
      return this.notifications.filter(n => !n.read).length;
    }

    addNotification(notif) {
      const item = {
        id: 'notif-' + Date.now(),
        time: 'Just now',
        read: false,
        ...notif
      };
      this.notifications.unshift(item);
      this.save(STORAGE_KEYS.NOTIFS, this.notifications);
      this.notify('notifications:changed', this.notifications);
      return item;
    }

    markAllNotificationsRead() {
      this.notifications.forEach(n => n.read = true);
      this.save(STORAGE_KEYS.NOTIFS, this.notifications);
      this.notify('notifications:changed', this.notifications);
    }

    // --- Session / Pairing API ---
    getSession() {
      return this.session;
    }

    setSessionPaired(deviceName) {
      this.session.paired = true;
      this.session.device = deviceName || 'Connected Device';
      this.addNotification({
        title: 'Device Paired for Session',
        message: `Connected with ${this.session.device}. Live sync active until tab is closed.`,
        type: 'sync'
      });
      this.notify('session:changed', this.session);
    }

    disconnectSession() {
      this.session.paired = false;
      this.session.device = null;
      this.addNotification({
        title: 'Session Disconnected',
        message: 'Temporary pairing ended. Notes remain safely in your workspace.',
        type: 'sync'
      });
      this.notify('session:changed', this.session);
    }

    // SVG Helpers for new captures
    helpers = {
      createWhiteboardSvg,
      createNotebookSvg,
      createReceiptSvg,
      createDocumentSvg
    };
  }

  global.NoseerStore = new Store();
})(window);
