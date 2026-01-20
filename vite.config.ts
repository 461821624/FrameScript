import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern'
      }
    }
  },
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src'),
      '@electron': path.join(__dirname, 'electron'),
      '@shared': path.join(__dirname, 'shared'),
    },
  },
  plugins: [
    vue(),
    electron({
      main: {
        entry: {
          main: 'electron/main.ts',
          'workers/video-worker': 'electron/workers/video-worker.ts',
        },
        vite: {
          build: {
            rollupOptions: {
              external: [
                'electron',
                '@ffmpeg-installer/ffmpeg',
                'electron-log',
                '@google/genai',
                'ws',
                'bufferutil',
                'utf-8-validate',
                'node-fetch',
              ],
            },
          },
        },
      },
      preload: {
        // Shortcut of `build.rollupOptions.input`.
        // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
        input: path.join(__dirname, 'electron/preload.ts'),
      },
      // Ployfill the Electron and Node.js API for Renderer process.
      // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
      // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
      renderer: process.env.NODE_ENV === 'test'
        // https://github.com/electron-vite/vite-plugin-electron-renderer/issues/78#issuecomment-2053600808
        ? undefined
        : {},
    }),
  ],
})
