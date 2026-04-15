/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Lora', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#fafaf8',
          100: '#f0efe9',
          200: '#e0dfd6',
          300: '#c8c6b8',
          400: '#a8a690',
          500: '#88866e',
          600: '#6b6952',
          700: '#524f3d',
          800: '#38362a',
          900: '#1a1a12',
        }
      }
    },
  },
  plugins: [],
}