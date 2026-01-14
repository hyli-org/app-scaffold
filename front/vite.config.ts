import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^buffer$/,
        replacement: path.resolve(__dirname, 'src/shims/buffer.ts'),
      },
    ],
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
    exclude: ['@noir-lang/noirc_abi', '@noir-lang/acvm_js'],
  },
  define: {
    global: 'window',
  },
  server: {
    fs: {
      allow: ['../..'],
    },
  },
})