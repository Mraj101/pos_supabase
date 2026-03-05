/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        rose:    { DEFAULT: '#C4687A', light: '#F2D0D8', dark: '#9E4A5A' },
        gold:    { DEFAULT: '#B8965A', light: '#E8D5A3' },
        cream:   { DEFAULT: '#FBF7F4', dark: '#F0E9E2' },
        charcoal:{ DEFAULT: '#2D2D2D', soft: '#5A5A5A' },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
