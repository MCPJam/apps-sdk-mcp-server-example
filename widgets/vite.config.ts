import { defineConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({}) => ({
  publicDir: 'public',
  plugins: [
    react(),
    {
      name: 'widget-html-middleware',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          // Rewrite /tasks to /tasks/index.html
          if (req.url?.startsWith('/tasks') && !req.url.includes('.')) {
            req.url = req.url.replace(/\/?$/, '/index.html');
          }
          // Rewrite /tasks/index.tsx to the actual file path
          if (req.url === '/tasks/index.tsx') {
            req.url = '/tasks/index.tsx';
          }
          next();
        });
      },
    },
  ],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
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
      preserveEntrySignatures: 'strict',
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
}));
