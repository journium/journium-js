import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index-esm.html'
      }
    }
  },
  server: {
    port: 3008,
    open: true
  }
});
