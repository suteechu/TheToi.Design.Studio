import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // ✅ ตรงนี้สำคัญมาก! ให้เปลี่ยนเป็น '/' หรือ './' 
})