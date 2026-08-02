import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.06), 0 20px 40px rgba(0,0,0,0.35)'
      }
    }
  },
  plugins: []
} satisfies Config;
