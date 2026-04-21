/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F9FAF8', // Very light off-white olive tint
        surface: '#FFFFFF', // Primary white
        primary: '#FFFFFF', // Primary White
        secondary: '#B5C1A2', // Pastel Olive Green
        accent: '#839670', // Deeper Olive Accent
        textPrimary: '#2E3A28', // Dark Olive Text
        textSecondary: '#6B7A63', // Muted Olive Text
      },
    },
  },
  plugins: [],
}
