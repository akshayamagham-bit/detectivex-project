/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forensic: {
          bg: '#030712',
          sidebar: '#111827',
          card: '#1F2937',
          cardalt: '#172033',
          border: '#374151',
          primary: '#F59E0B',
          secondary: '#06B6D4',
          success: '#22C55E',
          warning: '#F97316',
          danger: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.37)',
        glow: '0 0 20px rgba(245,158,11,0.25)',
        glowCyan: '0 0 20px rgba(6,182,212,0.25)',
      },
      backgroundImage: {
        'grid-pattern':
          "linear-gradient(rgba(55,65,81,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(55,65,81,0.15) 1px, transparent 1px)",
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'scan-line': 'scan-line 3s linear infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
