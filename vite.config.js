import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/TheToi.Design.Studio/', // ✅ สำหรับ GitHub Pages ต้องมีบรรทัดนี้ครับ
})