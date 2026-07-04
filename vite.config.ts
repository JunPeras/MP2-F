import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis",
    "process.env": "{}",
  },
  resolve: {
    alias: {
      events: "events",
      util: "util",
      process: "process/browser",
    },
  },
  optimizeDeps: {
    include: ["events", "util", "process", "simple-peer"],
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://backend:3000',
        changeOrigin: true,
      }
    }
  }
});
