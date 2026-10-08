// Noseer Material 3 Monochromatic & Tonal Accent System

(function(global) {
  // Preset accent colors
  const ACCENT_PRESETS = [
    { name: 'Slate Blue', hex: '#0284c7' },
    { name: 'Teal Emerald', hex: '#0d9488' },
    { name: 'Amber Gold', hex: '#d97706' },
    { name: 'Royal Violet', hex: '#7c3aed' },
    { name: 'Rose Quartz', hex: '#e11d48' },
    { name: 'Minimalist Steel', hex: '#475569' }
  ];

  function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const num = parseInt(hex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  class ThemeController {
    constructor() {
      this.init();
    }

    init() {
      const settings = global.NoseerStore.getSettings();
      this.applyTheme(settings.theme || 'dark');
      this.applyAccent(settings.accentColor || '#0284c7');

      // Listen to store updates
      global.NoseerStore.subscribe((event, data) => {
        if (event === 'settings:changed') {
          this.applyTheme(data.theme);
          this.applyAccent(data.accentColor);
        }
      });
    }

    applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
    }

    applyAccent(hex) {
      const rgb = hexToRgb(hex);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

      const root = document.documentElement;
      root.style.setProperty('--md-accent-raw', hex);
      root.style.setProperty('--md-accent-primary', hex);
      root.style.setProperty('--md-accent-container', `hsla(${hsl.h}, ${Math.min(hsl.s, 60)}%, ${isDark ? '20%' : '90%'}, 0.3)`);
      root.style.setProperty('--md-accent-on-container', `hsl(${hsl.h}, ${Math.min(hsl.s, 85)}%, ${isDark ? '80%' : '25%'})`);
      root.style.setProperty('--md-accent-border', `hsla(${hsl.h}, ${hsl.s}%, 50%, 0.35)`);
      root.style.setProperty('--md-accent-glow', `hsla(${hsl.h}, ${hsl.s}%, 55%, 0.35)`);

      // Camera aspect ratio matte: dark tint intentionally derived from accent color
      if (isDark) {
        root.style.setProperty('--md-accent-letterbox', `hsl(${hsl.h}, ${Math.round(hsl.s * 0.35)}%, 6%)`);
      } else {
        root.style.setProperty('--md-accent-letterbox', `hsl(${hsl.h}, ${Math.round(hsl.s * 0.25)}%, 92%)`);
      }
    }

    getPresets() {
      return ACCENT_PRESETS;
    }
  }

  global.NoseerTheme = new ThemeController();
})(window);
