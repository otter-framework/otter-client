/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    minWidth: {
      message: "300px",
    },
    extend: {},
  },
  plugins: [require("@tailwindcss/forms")],
};
