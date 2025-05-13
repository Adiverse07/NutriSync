import { fontFamily } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', ...fontFamily.sans],
      },
      colors: {
        background: '#0f0f1a',
        primary: '#646cff',
      },
      animation: {
        'spin-slow': 'spin 1.5s linear infinite',
      },
      backgroundImage: {
        // an inward‐fading radial from pale violet at center to deep navy
        'aesthetic-radial': 'radial-gradient(circle at center, rgba(156, 12, 246, 0.4) 0%, rgb(27, 27, 61) 100%)',
      },
    },
  },
  plugins: [],
}