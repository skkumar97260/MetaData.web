/** @type {import('tailwindcss').Config} */
module.exports = {
  content: 
     ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {},
    screens: {
      sm: '640px',  // Define the minimum width for `sm`
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  },
  variants: {},
  plugins: [require("daisyui")],
}  

