import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// Manual, stable Vite config for a Manifest V3 extension (Side Panel + service worker).
// We intentionally avoid beta build plugins so the build is reliable on any Node version.
// - index.html      -> the Side Panel UI (React). Its JS is hashed automatically.
// - src/background.js -> the service worker. Emitted to dist/background.js (no hash) so
//                        the manifest can reference a stable path.
// - public/*        -> copied verbatim to dist/ (manifest.json, icons/).
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        sidepanel: resolve(import.meta.dirname, 'index.html'),
        background: resolve(import.meta.dirname, 'src/background.js'),
      },
      output: {
        entryFileNames: (chunk) =>
          chunk.name === 'background' ? 'background.js' : 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
})
