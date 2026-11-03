/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'Poppins', 'Inter', 'sans-serif'],
      },
      colors: {
        dark: {
          bg: '#0d0d0f',
          card: '#131316',
          surface: '#1a1a1f',
        },
        gold: {
          start: '#7a5a12',
          mid: '#d4a52a',
          end: '#8a6414',
          light: '#e6b83a',
        }
      }
    },
  },
  plugins: [],
}

