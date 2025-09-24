/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        roboto: ["Roboto", "sans-serif"],
         lobster: ['Lobster', 'cursive'], 
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
