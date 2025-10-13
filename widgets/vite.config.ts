import { defineConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'widget-html-middleware',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url?.startsWith('/widgets/') && !req.url.includes('.')) {
            req.url = req.url.replace(/\/?$/, '/index.html');
          }
          next();
        });
      },
    },
  ],
  server: {
    port: 4444,
    strictPort: true,
    cors: true,
    open: false,
    fs: {
      strict: false,
    },
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
    target: 'es2022',
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    minify: 'esbuild',
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        tasks: resolve(__dirname, 'tasks/index.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
});
