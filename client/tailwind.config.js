/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF4B3E', // Warm red/orange CTA
          alt: '#FF7A00',
        },
        secondary: '#FFB100', // Highlights/badges
        background: {
          light: '#FFF8F3', // Off-white
          dark: '#1A1A1A', // Charcoal
        },
        surface: {
          light: '#FFFFFF',
          dark: '#2A2A2A',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'clay': 'inset 2px 2px 5px rgba(255, 255, 255, 0.3), inset -3px -3px 7px rgba(0, 0, 0, 0.03), 0 4px 10px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
