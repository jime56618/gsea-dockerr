/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <-- Esto es vital para que lea tus componentes
  ],
  theme: {
    extend: {
      colors: {
        'gsea-navy': '#001F3F',       // Midnight Mirage
        'gsea-blue': '#1E488F',       // Nuit Blanche (Para botones)
        'gsea-light': '#F3F2EA',      // Picket Fence (Fondo card)
        'gsea-teal': '#09324A',       // Halite Blue (Texto)
        'gsea-border': '#AED0C9',     // Cassiopeia
        'gsea-accent': '#DBE64C',     // First Colors of Spring
      },
    },
  },
}