/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'limpopo-green': '#2D5016',
        'limpopo-gold': '#FFD700',
        'limpopo-blue': '#1E40AF',
      }
    },
  },
  plugins: [],
}