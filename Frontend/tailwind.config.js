export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'custom-md': '900px', // Custom breakpoint for 800px
      },
    },
  },
  plugins: [],
};
