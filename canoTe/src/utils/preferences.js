import { state, notify } from '../state.js';

const PREFS_KEY = 'tactile_prefs';

export const DEFAULT_PREFS = {
  modeIndex: 0,   // DARK=0, LIGHT=1, OLED=2
  toneIndex: 0,   // SLATE=0, MONO=1, INK=2
  ratioIndex: 0,  // 19.5:9=0, 4:3=1, 16:9=2, 1:1=3
  hapticOn: true,
  privacyOn: true,
};

// Accent tones, expressed as RGB triplets to match the CSS color tokens.
// Each tone has dark (DARK/OLED) and light (LIGHT) variants so the accent
// always keeps enough contrast against the active surface palette.
const TONE_ACCENTS = [
  {
    name: 'SLATE',
    dark:  { primary: '255 255 255', onPrimary: '47 49 50',  indicator: '148 163 184' },
    light: { primary: '71 75 79',    onPrimary: '255 255 255', indicator: '100 116 139' },
  },
  {
    name: 'MONO',
    dark:  { primary: '198 198 199', onPrimary: '26 28 29',  indicator: '113 113 122' },
    light: { primary: '44 44 46',    onPrimary: '255 255 255', indicator: '113 113 122' },
  },
  {
    name: 'INK',
    dark:  { primary: '226 226 227', onPrimary: '15 23 42',  indicator: '56 189 248' },
    light: { primary: '15 23 42',    onPrimary: '255 255 255', indicator: '2 132 199' },
  },
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
  const isLight = mode === 'LIGHT';

  root.classList.remove('dark', 'light', 'oled');
  root.classList.add(isLight ? 'light' : 'dark');
  if (mode === 'OLED') root.classList.add('oled');

  // 2. Accent Tone -> color tokens consumed by Tailwind utilities
  const tone = TONE_ACCENTS[prefs.toneIndex] || TONE_ACCENTS[0];
  const accent = (isLight ? tone.light : tone.dark) || tone.dark;
  root.style.setProperty('--color-primary', accent.primary);
  root.style.setProperty('--color-on-primary', accent.onPrimary);
  root.style.setProperty('--color-indicator', accent.indicator);
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
