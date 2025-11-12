/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0a0a0a',
        secondary: '#d4af37',
        background: '#121212',
        card: '#1e1e1e',
        border: '#333',
      },
    },
  },
  plugins: [],
}