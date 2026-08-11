/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#241512",
        paper: "#FFF9F0",
        clay: "#7A3B2E",
        chili: "#C6432B",
        turmeric: "#E8A33D",
        curry: "#4B7A3D",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["'Work Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      backgroundImage: {
        "torn-edge":
          "linear-gradient(-45deg, transparent 8px, #FFF9F0 8px), linear-gradient(45deg, transparent 8px, #FFF9F0 8px)",
      },
      backgroundSize: {
        torn: "16px 16px",
      },
    },
  },
  plugins: [],
};
