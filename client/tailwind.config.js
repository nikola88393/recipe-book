/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Core surface hierarchy ───────────────────────────────────────
        background: "#fbf9f2",
        "surface": "#fbf9f2",
        "surface-dim": "#dbdad3",
        "surface-bright": "#fbf9f2",
        "surface-container": "#efeee7",
        "surface-container-low": "#f5f4ed",
        "surface-container-high": "#e9e8e1",
        "surface-container-highest": "#e3e3dc",
        "surface-container-lowest": "#ffffff",
        "surface-variant": "#e3e3dc",
        "surface-tint": "#3b6840",

        // ── Primary (Celadon) ────────────────────────────────────────────
        "primary": "#3b6840",
        "primary-container": "#94c595",
        "primary-fixed": "#bcefbc",
        "primary-fixed-dim": "#a1d3a2",
        "on-primary": "#ffffff",
        "on-primary-container": "#26522d",
        "on-primary-fixed": "#002108",
        "on-primary-fixed-variant": "#23502a",
        "inverse-primary": "#a1d3a2",

        // ── Secondary ─────────────────────────────────────────────────────
        "secondary": "#5f5e5d",
        "secondary-container": "#e2dfdd",
        "secondary-fixed": "#e5e2e0",
        "secondary-fixed-dim": "#c9c6c4",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#636261",
        "on-secondary-fixed": "#1c1c1a",
        "on-secondary-fixed-variant": "#474745",

        // ── Tertiary ──────────────────────────────────────────────────────
        "tertiary": "#276b3d",
        "tertiary-container": "#83c892",
        "tertiary-fixed": "#abf3b9",
        "tertiary-fixed-dim": "#90d69f",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#09552a",
        "on-tertiary-fixed": "#00210c",
        "on-tertiary-fixed-variant": "#045228",

        // ── Error ─────────────────────────────────────────────────────────
        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
        "error-crimson": "#b53333",

        // ── On-surface tokens ──────────────────────────────────────────────
        "on-surface": "#1b1c18",
        "on-surface-variant": "#424940",
        "inverse-surface": "#30312c",
        "inverse-on-surface": "#f2f1ea",

        // ── Outline ────────────────────────────────────────────────────────
        "outline": "#727970",
        "outline-variant": "#c1c9be",

        // ── Named semantic colors (design system) ─────────────────────────
        "parchment": "#f5f4ed",
        "ivory": "#faf9f5",
        "warm-sand": "#e8e6dc",
        "charcoal-warm": "#4d4c48",
        "olive-gray": "#5e5d59",
        "stone-gray": "#87867f",
        "border-cream": "#f0eee6",
        "ring-warm": "#d1cfc5",

        // ── Legacy compat ─────────────────────────────────────────────────
        "celadon": "#94c595",
        "celadon-accent": "#a1d3a2",
        "focus": "#3898ec",
        "foreground": "#1b1c18",

        // ── shadcn base ────────────────────────────────────────────────────
        "border": "#f0eee6",
        "input": "#faf9f5",
        "ring": "#3898ec",
      },

      fontFamily: {
        // Stitch design system fonts
        literata: ['Literata', 'Georgia', 'serif'],
        franklin: ['Libre Franklin', 'Arial', 'sans-serif'],
        // Legacy fallbacks
        serif: ['Literata', 'Georgia', 'serif'],
        sans: ['Libre Franklin', 'Arial', 'sans-serif'],
        mono: ['monospace'],
      },

      fontSize: {
        "display-hero": ["64px", { lineHeight: "1.1", fontWeight: "500" }],
        "section-heading": ["52px", { lineHeight: "1.2", fontWeight: "500" }],
        "sub-heading-lg": ["36px", { lineHeight: "1.3", fontWeight: "500" }],
        "sub-heading-lg-mobile": ["28px", { lineHeight: "1.2", fontWeight: "500" }],
        "feature-title": ["21px", { lineHeight: "1.2", fontWeight: "500" }],
        "body-serif": ["17px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-large": ["20px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-standard": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "1.4", fontWeight: "500" }],
        "overline": ["10px", { lineHeight: "1.6", letterSpacing: "0.5px", fontWeight: "500" }],
      },

      spacing: {
        "base": "8px",
        "gutter": "24px",
        "section-gap": "80px",
        "margin-mobile": "20px",
        "margin-desktop": "40px",
        "container-max": "1200px",
      },

      maxWidth: {
        "container": "1200px",
      },

      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
        full: "9999px",
      },

      boxShadow: {
        "ring": "0px 0px 0px 1px #d1cfc5",
        "ring-warm": "0px 0px 0px 1px #d1cfc5",
        "ring-subtle": "0px 0px 0px 1px #c1c9be",
        "ring-deep": "0px 0px 0px 1px #c2c0b6",
        "whisper": "0 10px 24px -4px rgba(0,0,0,0.05)",
        "whisper-lg": "0 24px 48px -8px rgba(0,0,0,0.07)",
        "float": "0 8px 32px rgba(0,0,0,0.12)",
      },

      backgroundImage: {
        "parchment-gradient": "linear-gradient(135deg, #fbf9f2 0%, #f5f4ed 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
