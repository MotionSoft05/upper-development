/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
  ],
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Upper Brand Colors
        upper: {
          // Primary Blue (botones, links, acentos)
          blue: "#0080FF",
          "blue-dark": "#0066CC",
          "blue-light": "#3399FF",

          // Cyan Gradient (usado en CTAs y botones principales)
          cyan: "#06B6D4",
          "cyan-dark": "#0891B2",

          // Grays (texto y fondos)
          "gray-900": "#111827", // Texto principal negro
          "gray-700": "#374151", // Texto secundario
          "gray-500": "#6B7280", // Texto terciario/muted
          "gray-200": "#E5E7EB", // Bordes y separadores
          "gray-100": "#F3F4F6", // Fondos claros
          "gray-50": "#F9FAFB", // Fondos muy claros
        },

        // Legacy colors (mantener compatibilidad)
        custom: "#2cced7",
        Second: "#48cae4",
        third: "#333333",
        fourth: "#000000",
        color: "#283747",
      },
      backgroundImage: {
        // Upper Gradients
        "upper-gradient": "linear-gradient(to right, #06B6D4, #0080FF)",
        "upper-gradient-hover": "linear-gradient(to right, #0891B2, #0066CC)",

        // Legacy gradients
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        // Upper shadows
        "upper-sm": "0 2px 8px rgba(0, 128, 255, 0.15)",
        "upper-md": "0 4px 16px rgba(0, 128, 255, 0.2)",
        "upper-lg": "0 8px 32px rgba(0, 128, 255, 0.25)",
      },
    },
  },
  plugins: [],
};
