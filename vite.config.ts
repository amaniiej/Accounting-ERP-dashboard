import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    open: true
  },
  optimizeDeps: {
    // Cette section force Vite à pré-bundler "react-is" 
    // pour éviter l'erreur de résolution rencontrée par Recharts
    include: ['react-is'],
  },
  resolve: {
    // Optionnel : aide à la résolution des modules CommonJS si nécessaire
    mainFields: ['module', 'jsnext:main', 'js', 'main'],
  }
})