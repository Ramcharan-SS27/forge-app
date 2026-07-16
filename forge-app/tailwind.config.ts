import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forge: {
          bg: '#08080f',
          sidebar: '#0b0b18',
          surface: '#0f0f1e',
          surface2: '#141428',
          border: '#1c1c32',
          accent: '#7c6af7',
          'accent-dim': '#4a3aaa',
          text: '#d8d8f0',
          text2: '#7070a0',
          text3: '#363660',
          success: '#34d399',
          warning: '#f59e0b',
          danger: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
export default config;
