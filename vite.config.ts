import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // relative asset paths so the build works from any sub-folder or static host
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React gets its own chunk so the 3D vendor code (three + R3F + drei) stays lazy-loaded
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react'
          if (/node_modules\/(three|@react-three|three-stdlib|troika|camera-controls|maath|meshline|@monogrid|stats|detect-gpu|zustand|its-fine|suspend-react|tunnel-rat|use-sync-external-store|react-use-measure|hls\.js)/.test(id)) return 'three'
          if (id.includes('node_modules/gsap') || id.includes('node_modules/lenis')) return 'gsap'
        },
      },
    },
  },
})
