/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Asana-inspired palette
        asana: {
          pink: '#FFC7DB',
          green: '#5DA283',
          successText: '#66A88B',
          neptune: '#74BFB8',
          aquaBg: '#A9DCD9',
          aqua: '#9EE7E3',
          coral: '#F06A6A',
          charcoal: '#2F2F2F',
        },
      },
    },
  },
  plugins: [],
}
