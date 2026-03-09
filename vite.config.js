import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // ✅ แก้ตรงนี้เป็น './' ครับ (จุดและสแลช)
})