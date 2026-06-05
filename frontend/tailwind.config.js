/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: "#fff",
        black: "#000",
        // ✅ 객체 대신 flat하게 분리
        primary: '#464BAA',
        'primary-light': '#7B8FE0',
        'primary-dark': '#3B3F90',
      },
    },
  },
  plugins: [],
}