import { app, BrowserWindow, protocol } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { registerIpcHandlers } from './ipc/handlers'
import { logger } from './utils/logger'
import { handleAtomProtocol } from './utils/protocol-helper'


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
    width: 1280,
    height: 800,
    resizable: false,
    maximizable: false,
    icon: path.join(process.env.VITE_PUBLIC, 'logo.svg'),
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
  logger.info('应用已启动')

  // Register custom protocol for local files
  protocol.handle('atom', handleAtomProtocol)

  registerIpcHandlers()
  createWindow()
})
