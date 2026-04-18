/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0F172A',
        card: '#1E293B',
        blue: {
          DEFAULT: '#3B82F6',
          dark: '#2563EB',
        },
        green: {
          DEFAULT: '#22C55E',
        },
        muted: '#64748B',
        border: '#334155',
      },
    },
  },
  plugins: [],
};
