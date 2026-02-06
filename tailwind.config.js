/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { 
    extend: {
      fontFamily: {
        // Tu ajoutes cette ligne pour enregistrer Aeonik
        aeonik: ['Aeonik', 'sans-serif'],
      },
    },
  },
  plugins: [],
}