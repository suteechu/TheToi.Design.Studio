import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/TheToi.Design.Studio/', // <--- บรรทัดนี้สำคัญที่สุด! ต้องมีเครื่องหมาย / ปิดท้ายด้วย
})