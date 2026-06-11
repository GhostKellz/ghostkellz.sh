/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ghost: {
          bg: '#0a0a12',
          surface: '#12121a',
          border: '#1e1e2e',
          text: '#e0e0e0',
          muted: '#888899',
          cyan: '#4fd1c5',
          teal: '#38b2ac',
          blue: '#3b82f6',
          glow: '#64ffda',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'typing': 'typing 3.5s steps(40, end)',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { textShadow: '0 0 8px #4fd1c5' },
          '50%': { textShadow: '0 0 20px #64ffda, 0 0 30px #4fd1c5' },
        },
        'typing': {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        'blink': {
          '50%': { borderColor: 'transparent' },
        },
      },
    },
  },
  plugins: [],
};
