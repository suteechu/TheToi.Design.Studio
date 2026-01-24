import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/thetoi-design-studio/', // 👈 ชื่อ repo GitHub
})
