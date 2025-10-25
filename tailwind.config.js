/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.{css}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#F3860B",
      },
    },
  },
  darkMode: false,
  plugins: [],
}

