import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/TheToi.Design.Studio/', // ✅ ปรับแก้ให้ตรงกับชื่อ Repository จริงบน GitHub
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('d3-')) return 'charts';
            if (id.includes('lucide-react')) return 'icons';
          }
        },
      },
    },
  },
})