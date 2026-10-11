/**
 * All colors are backed by CSS variables (RGB triplets) defined in
 * src/styles/style.css. The variables are swapped per theme:
 *   html.dark (default) / html.light / html.oled
 * Accent tones also override --color-primary / --color-on-primary at runtime
 * (see src/utils/preferences.js). Using `rgb(var(--color-x) / <alpha-value>)`
 * keeps Tailwind opacity modifiers (e.g. bg-primary/10) working.
 */
const color = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,html}"
  ],
  theme: {
    extend: {
      colors: {
        "primary": color("primary"),
        "on-primary": color("on-primary"),
        "primary-container": color("primary-container"),
        "on-primary-container": color("on-primary-container"),
        "primary-fixed": color("primary-fixed"),
        "primary-fixed-dim": color("primary-fixed-dim"),
        "on-primary-fixed": color("on-primary-fixed"),
        "on-primary-fixed-variant": color("on-primary-fixed-variant"),

        "secondary": color("secondary"),
        "on-secondary": color("on-secondary"),
        "secondary-container": color("secondary-container"),
        "on-secondary-container": color("on-secondary-container"),
        "secondary-fixed": color("secondary-fixed"),
        "secondary-fixed-dim": color("secondary-fixed-dim"),
        "on-secondary-fixed": color("on-secondary-fixed"),
        "on-secondary-fixed-variant": color("on-secondary-fixed-variant"),

        "tertiary": color("tertiary"),
        "on-tertiary": color("on-tertiary"),
        "tertiary-container": color("tertiary-container"),
        "on-tertiary-container": color("on-tertiary-container"),
        "tertiary-fixed": color("tertiary-fixed"),
        "tertiary-fixed-dim": color("tertiary-fixed-dim"),
        "on-tertiary-fixed": color("on-tertiary-fixed"),
        "on-tertiary-fixed-variant": color("on-tertiary-fixed-variant"),

        "error": color("error"),
        "on-error": color("on-error"),
        "error-container": color("error-container"),
        "on-error-container": color("on-error-container"),

        "surface": color("surface"),
        "surface-dim": color("surface-dim"),
        "surface-bright": color("surface-bright"),
        "surface-container-lowest": color("surface-container-lowest"),
        "surface-container-low": color("surface-container-low"),
        "surface-container": color("surface-container"),
        "surface-container-high": color("surface-container-high"),
        "surface-container-highest": color("surface-container-highest"),
        "surface-variant": color("surface-variant"),
        "surface-tint": color("surface-tint"),

        "background": color("background"),
        "on-surface": color("on-surface"),
        "on-surface-variant": color("on-surface-variant"),
        "outline": color("outline"),
        "outline-variant": color("outline-variant"),
        "inverse-surface": color("inverse-surface"),
        "inverse-on-surface": color("inverse-on-surface"),
        "inverse-primary": color("inverse-primary"),

        "indicator": color("indicator")
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px"
      },
      spacing: {
        "margin": "1rem",
        "space-sm": "0.5rem",
        "gutter-tablet": "1.25rem",
        "space-lg": "1.25rem",
        "space-xl": "2rem",
        "gutter-desktop": "1.5rem",
        "margin-tablet": "1.5rem",
        "margin-desktop": "2rem",
        "space-xs": "0.25rem",
        "space-md": "0.75rem",
        "gutter": "1rem"
      },
      fontFamily: {
        "label-md": ["JetBrains Mono", "monospace"],
        "display-lg-mobile": ["Space Grotesk", "sans-serif"],
        "body-md": ["Hanken Grotesk", "sans-serif"],
        "headline-lg": ["Space Grotesk", "sans-serif"],
        "body-lg": ["Hanken Grotesk", "sans-serif"],
        "label-lg": ["JetBrains Mono", "monospace"],
        "headline-lg-mobile": ["Space Grotesk", "sans-serif"],
        "display-lg": ["Space Grotesk", "sans-serif"],
        "headline-md": ["Space Grotesk", "sans-serif"],
        "label-sm": ["JetBrains Mono", "monospace"],
        "body-sm": ["Hanken Grotesk", "sans-serif"]
      }
    }
  },
  plugins: [],
}
