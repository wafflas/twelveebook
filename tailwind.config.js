/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.css",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#F3860B",
        linkblue: "#3B5998",
        timestampgray: "#8F8F8F",
      },
      fontFamily: {
        sans: ["var(--font-klavika)", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
