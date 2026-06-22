import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.CAPACITOR_BUILD === 'true' ? './' : '/PokedexReact/',
  server: {
    port: 5174,
    proxy: {
      "/smogon-stats": {
        target: "https://www.smogon.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/smogon-stats/, "/stats"),
      },
    },
  },
  css: {
    postcss: './postcss.config.cjs',
  },
  build: {
    outDir: 'dist',
    target: 'es2015',
    emptyOutDir: true,
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) return 'react-vendor';
          if (id.includes('node_modules/@tanstack/react-query')) return 'query';
          if (id.includes('node_modules/chart.js') || id.includes('node_modules/react-chartjs-2')) return 'charts';
          if (id.includes('node_modules/react-icons/bi')) return 'icons';
        },
      },
    },
  },
})
