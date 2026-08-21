import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#FBFBF8', // override navy to base light color to avoid changing all class names immediately
          90: 'rgba(251, 251, 248, 0.9)',
          80: 'rgba(251, 251, 248, 0.8)',
          60: 'rgba(251, 251, 248, 0.6)',
          20: 'rgba(251, 251, 248, 0.2)',
          light: '#FFFFFF',
          mid: '#F3F3F0',
          deep: '#181922', // text color mapping
          surface: '#FFFFFF',
        },
        base: '#FBFBF8',
        text: '#181922',
        aurora: {
          1: '#6C63FF',
          2: '#8B5CF6',
          3: '#D946EF',
          4: '#FF5FA2',
          5: '#FFB86B',
        },
        accent: {
          DEFAULT: '#6C63FF',
          glow: 'rgba(108, 99, 255, 0.15)',
          'glow-strong': 'rgba(108, 99, 255, 0.3)',
          dim: 'rgba(108, 99, 255, 0.6)',
          trace: 'rgba(108, 99, 255, 0.08)',
          signal: '#8B5CF6',
        },
        'warm-ivory': '#FFFFFF',
        'soft-mineral': '#F3F3F0',
        graphite: '#181922',
        'muted-grey': '#8D9299',
        'warning-amber': '#FFB86B',
        'critical-red': '#FF5FA2',
        amber: '#FFB86B',
        'red-signal': '#FF5FA2',
        'blue-data': '#6C63FF',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(var(--tw-gradient-stops))',
        'aurora-gradient': 'linear-gradient(135deg, #6C63FF, #8B5CF6, #D946EF, #FF5FA2, #FFB86B)',
        'aurora-light': 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(139,92,246,0.1), rgba(217,70,239,0.1), rgba(255,95,162,0.1), rgba(255,184,107,0.1))',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'aurora-pan': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        }
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'aurora-pan': 'aurora-pan 15s ease infinite',
      }
    },
  },
  plugins: [],
};
export default config;
