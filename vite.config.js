import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/TheToi.Design.Studio/', // ✅ ปรับแก้ให้ตรงกับชื่อ Repository จริงบน GitHub
})