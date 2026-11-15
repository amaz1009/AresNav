/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        mars: {
          bg: '#050507',
          panel: '#0A0B0E',
          border: '#181A22',
          orange: '#d9532f',
          red: '#c0392b',
          muted: '#8b92a5',
        },
      },
    },
  },
  plugins: [],
};
