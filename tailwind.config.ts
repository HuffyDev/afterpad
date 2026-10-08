import type { Config } from 'tailwindcss';

export default {
  content: ['./client/index.html', './client/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#080706',
          900: '#0b0a09',
          850: '#100f0d',
          800: '#151311',
          750: '#1b1916',
          700: '#24211d',
          600: '#34302a',
          500: '#5a544c',
          400: '#8a8379',
          300: '#b3ab9f',
          200: '#d9d2c6',
          100: '#efe9df',
        },
        glow: {
          DEFAULT: '#f3a649',
          soft: '#f3a64926',
          dim: '#a8732f',
          hot: '#ffc77a',
        },
        bad: '#e2674f',
        ok: '#9fbf86',
      },
      fontFamily: {
        sans: ['"Inter Tight"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: { tightest: '-0.045em' },
      boxShadow: {
        glow: '0 0 0 1px #f3a64955, 0 0 32px -6px #f3a64980',
        'glow-lg': '0 0 120px -20px #f3a64966',
      },
      keyframes: {
        flicker: { '0%,100%': { opacity: '1' }, '47%': { opacity: '1' }, '48%': { opacity: '.86' }, '49%': { opacity: '1' }, '82%': { opacity: '.95' } },
        blink: { '0%,49%': { opacity: '1' }, '50%,100%': { opacity: '0' } },
        rise: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } },
        breathe: { '0%,100%': { opacity: '.55' }, '50%': { opacity: '.8' } },
      },
      animation: {
        flicker: 'flicker 6s infinite',
        blink: 'blink 1.05s steps(1) infinite',
        rise: 'rise .5s cubic-bezier(.2,.7,.2,1) both',
        breathe: 'breathe 7s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
