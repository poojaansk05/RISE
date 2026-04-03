/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gig: {
          orange: '#FF5722',
          green: '#4CAF50',
          dark: '#1A1A1A'
        }
      }
    },
  },
  plugins: [],
}
