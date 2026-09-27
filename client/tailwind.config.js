/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        risk: {
          high: "#B00020",
          medium: "#B36B00",
          low: "#1B5E20",
          info: "#374151"
        }
      }
    }
  },
  plugins: []
};
