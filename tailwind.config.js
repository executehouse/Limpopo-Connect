/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f4',
          100: '#dcf2e4',
          200: '#bbe4cb',
          300: '#8ed0a8',
          400: '#5bb67e',
          500: '#369b5c',
          600: '#277c47',
          700: '#20623a',
          800: '#1d4f30',
          900: '#194028',
          950: '#0b2415',
        },
        secondary: {
          50: '#fdf4e8',
          100: '#fae6c4',
          200: '#f4cc8b',
          300: '#edab52',
          400: '#e78f2a',
          500: '#d97010',
          600: '#bb540b',
          700: '#9b3c0c',
          800: '#7e3010',
          900: '#682811',
          950: '#3a1305',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}