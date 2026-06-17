import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // fallback to official plugin
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Adds lightning fast Tailwind CSS v4 compiling here
  ],
})