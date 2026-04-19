/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f6efe5",
        ink: "#1f2937",
        accent: "#d96c2d",
        accentDark: "#8b3c12",
        tealDeep: "#0f766e",
        sand: "#f2dfc8",
        moss: "#6c7a3b",
      },
      fontFamily: {
        display: ["Georgia", "Cambria", "serif"],
        body: ["Segoe UI", "Tahoma", "sans-serif"],
      },
      boxShadow: {
        panel: "0 20px 45px rgba(31, 41, 55, 0.12)",
      },
      backgroundImage: {
        mesh:
          "radial-gradient(circle at top left, rgba(217, 108, 45, 0.22), transparent 35%), radial-gradient(circle at top right, rgba(15, 118, 110, 0.2), transparent 32%), linear-gradient(135deg, #f6efe5 0%, #fbf7f1 48%, #f2dfc8 100%)",
      },
    },
  },
  plugins: [],
};
