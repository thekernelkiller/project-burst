/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      "dark-primary": "#131a1c",
      "dark-secondary": "#1b2224",
      red: "#e74c4c",
      green: "#6bb05d",
      blue: "#0183ff",
      grey: "#dddfe2",
      white: "#fff",
    },
    extend: {
      boxShadow: {
        "circle-white": "0 0 10px 3px rgba(255, 255, 255, 0.7)",
      },
      backgroundColor: {
        bg2: "rgba(219, 230, 253, 0.2)",
      },
    },
  },
  variants: {
    extend: {
      boxShadow: ["hover"],
      backgroundColor: ["hover"],
    },
  },
  plugins: [],
};
