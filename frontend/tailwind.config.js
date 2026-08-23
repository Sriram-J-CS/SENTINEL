/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ─── Dark palette tokens ─── */
        sentinel: {
          base:     '#050810',
          surface:  '#080C14',
          card:     '#0C1220',
          panel:    '#0A1018',
          border:   'rgba(255,255,255,0.07)',
        },
        /* ─── Light palette tokens ─── */
        sky: {
          base:     '#EFF6FF',
          card:     '#FFFFFF',
          border:   'rgba(14,165,233,0.2)',
        },
        /* ─── Accent tokens ─── */
        accent: {
          cyan:   '#22D3EE',
          green:  '#10B981',
          red:    '#F43F5E',
          amber:  '#FBBF24',
          violet: '#A78BFA',
        },
        /* ─── Legacy cyber tokens (kept for compat) ─── */
        cyber: {
          void:       '#030508',
          bg:         '#06090F',
          card:       '#0B0F19',
          cardHover:  '#111726',
          border:     '#1E293B',
          borderGlow: '#22D3EE',
          green:      '#10B981',
          cyan:       '#22D3EE',
          blue:       '#38BDF8',
          rose:       '#F43F5E',
          amber:      '#FBBF24',
          muted:      '#64748B',
          text:       '#F1F5F9'
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'glow-cyan':  '0 0 20px rgba(34,211,238,0.3)',
        'glow-green': '0 0 20px rgba(16,185,129,0.25)',
        'glow-red':   '0 0 20px rgba(244,63,94,0.25)',
      },
      animation: {
        'fade-in': 'fadeSlideIn 0.35s ease forwards',
      },
    },
  },
  plugins: [],
};
