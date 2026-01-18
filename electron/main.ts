import { app, BrowserWindow, protocol, net } from 'electron'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import { registerIpcHandlers } from './ipc/handlers'
import { logger } from './utils/logger'


const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
process.env.APP_ROOT = path.join(__dirname, '..')

// Register custom protocol for local files
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'atom',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true
    }
  }
])

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 940,
    minHeight: 600,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    frame: false, // Use custom title bar
    backgroundColor: '#00000000', // Transparent for glassmorphism
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  // Handle window states
  win.on('maximize', () => {
    win?.webContents.send('window-maximized', true)
  })
  win.on('unmaximize', () => {
    win?.webContents.send('window-maximized', false)
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  logger.info('App is ready')

  // Register custom protocol for local files
  protocol.handle('atom', (request) => {
    try {
      const url = new URL(request.url);
      let decodedPath = decodeURIComponent(url.pathname);
      let host = url.host;

      // Robustly reconstruct the absolute path on Windows
      let p = '';
      if (process.platform === 'win32') {
        // Case 1: atom://C:/path -> host is 'c:' or 'c', pathname is '/path'
        if (host) {
          p = host;
          if (!p.includes(':')) p += ':';
          p += decodedPath;
        } else {
          // Case 2: atom:///C:/path -> host is empty, pathname is '/C:/path'
          p = decodedPath;
          if (p.startsWith('/')) p = p.substring(1);
        }
      } else {
        // POSIX
        p = host ? host + decodedPath : decodedPath;
      }

      const filePath = path.normalize(p);
      const exists = fs.existsSync(filePath);

      if (!exists) {
        logger.warn(`[Protocol] 404: ${request.url} -> ${filePath}`);
        return new Response('File Not Found', { status: 404 });
      }

      return net.fetch(pathToFileURL(filePath).toString());
    } catch (error) {
      logger.error(`[Protocol] Error for ${request.url}:`, error);
      return new Response('Protocol Error', { status: 500 });
    }
  })

  registerIpcHandlers()
  createWindow()
})
