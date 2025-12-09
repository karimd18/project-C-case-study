/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        lightGray: "#F8FAFC",
        primary: {
          DEFAULT: "#002060", // Deep Royal Blue -> Keeping for brand, or changing? User said "navy colors in dark mode" to go away. Primary is usually brand.
          light: "#334D80",
          dark: "#001540",
        },
        navy: {
          // Redefining 'navy' as Slate for backward compat if I missed any refs, OR just providing slate.
          light: "#1e293b",
          DEFAULT: "#0f172a", // Slate 900
          dark: "#020617", // Slate 950
        },
        secondary: {
          DEFAULT: "#475569", // Slate
          light: "#94A3B8",
          dark: "#1E293B",
        },
        accent: {
          DEFAULT: "#EAB308", // Gold/Amber
          subtle: "#FEF3C7",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          hover: "#F1F5F9",
        },
      },
      fontFamily: {
        sans: ["Inter", "Roboto", "sans-serif"],
        display: ["Outfit", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        float:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};
