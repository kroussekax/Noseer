import { state, notify } from '../state.js';

const PREFS_KEY = 'tactile_prefs';

export const DEFAULT_PREFS = {
  modeIndex: 0,   // DARK=0, LIGHT=1, OLED=2
  toneIndex: 0,   // SLATE=0, MONO=1, INK=2
  ratioIndex: 0,  // 19.5:9=0, 4:3=1, 16:9=2, 1:1=3
  hapticOn: true,
  privacyOn: true,
};

const TONE_ACCENTS = [
  { name: 'SLATE', primary: '#ffffff', onPrimary: '#2f3132', indicator: '#94a3b8' },
  { name: 'MONO',  primary: '#c6c6c7', onPrimary: '#1a1c1d', indicator: '#71717a' },
  { name: 'INK',   primary: '#e2e2e3', onPrimary: '#0f172a', indicator: '#38bdf8' },
];

export function loadPreferences() {
  let stored = {};
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) stored = JSON.parse(raw);
  } catch (_) {}

  const merged = { ...DEFAULT_PREFS, ...stored };
  if (state && state.settings) {
    state.settings.modeIndex = merged.modeIndex ?? 0;
    state.settings.toneIndex = merged.toneIndex ?? 0;
    state.settings.ratioIndex = merged.ratioIndex ?? 0;
    state.settings.hapticOn = merged.hapticOn ?? true;
    state.settings.privacyOn = merged.privacyOn ?? true;
  }
  applyPreferences(merged);
  return merged;
}

export function savePreferences(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (_) {}
}

export function applyPreferences(prefs) {
  const root = document.documentElement;

  // 1. Display Mode: DARK (0), LIGHT (1), OLED (2)
  const mode = state.settings.modes[prefs.modeIndex] || 'DARK';
  root.classList.remove('dark', 'light', 'oled');

  if (mode === 'LIGHT') {
    root.classList.add('light');
    document.body.style.backgroundColor = '#f4f4f5';
  } else if (mode === 'OLED') {
    root.classList.add('dark', 'oled');
    document.body.style.backgroundColor = '#000000';
  } else {
    root.classList.add('dark');
    document.body.style.backgroundColor = '#131315';
  }

  // 2. Accent Tone
  const tone = TONE_ACCENTS[prefs.toneIndex] || TONE_ACCENTS[0];
  root.style.setProperty('--accent-primary', tone.primary);
  root.style.setProperty('--accent-on-primary', tone.onPrimary);
  root.style.setProperty('--accent-indicator', tone.indicator);
}

export function setPreference(key, value) {
  if (!state.settings) return;
  state.settings[key] = value;
  const current = {
    modeIndex: state.settings.modeIndex,
    toneIndex: state.settings.toneIndex,
    ratioIndex: state.settings.ratioIndex,
    hapticOn: state.settings.hapticOn,
    privacyOn: state.settings.privacyOn,
  };
  savePreferences(current);
  applyPreferences(current);
  notify();
}

export function resetPreferences() {
  if (!state.settings) return;
  state.settings.modeIndex = DEFAULT_PREFS.modeIndex;
  state.settings.toneIndex = DEFAULT_PREFS.toneIndex;
  state.settings.ratioIndex = DEFAULT_PREFS.ratioIndex;
  state.settings.hapticOn = DEFAULT_PREFS.hapticOn;
  state.settings.privacyOn = DEFAULT_PREFS.privacyOn;
  savePreferences(DEFAULT_PREFS);
  applyPreferences(DEFAULT_PREFS);
  notify();
}
