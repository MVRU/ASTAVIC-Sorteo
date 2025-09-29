// tailwind.config.js
module.exports = {
  content: [
    // "./index.html",            // si usas Vite
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9ecff",
          600: "#0d47a1",
          700: "#0b3b86",
        },
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(0,0,0,.15)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"), // opcional
    require("@tailwindcss/typography"), // opcional
  ],
};
