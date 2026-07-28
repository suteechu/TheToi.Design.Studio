/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fbf8f1',
          100: '#f5efe1',
          200: '#eadbc1',
          300: '#dfc29c',
          400: '#d1a473',
          500: '#c5a059',
          600: '#b47b42',
          700: '#966038',
          800: '#7a4e32',
          900: '#62412a',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Thai"', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      }
    },
  },
  plugins: [],
}