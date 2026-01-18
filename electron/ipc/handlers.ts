import { ipcMain, BrowserWindow, app, utilityProcess, dialog } from 'electron';
import { IPC_CHANNELS } from './constants';
import { WorkerMessage } from './types';
import { logger } from '../utils/logger';
import path from 'path';
import { fileURLToPath } from 'url';

import { registerProjectHandlers } from './project-handlers';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function registerIpcHandlers() {
    registerProjectHandlers();
    ipcMain.handle(IPC_CHANNELS.APP.GET_INFO, () => {
        return {
            name: app.getName(),
            version: app.getVersion(),
        };
    });

    ipcMain.handle(IPC_CHANNELS.APP.SELECT_DIRECTORY, async (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (!win) return null;

        const result = await dialog.showOpenDialog(win, {
            properties: ['openDirectory'],
            title: '选择输出目录',
            buttonLabel: '确定'
        });

        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }

        return result.filePaths[0];
    });

    ipcMain.on(IPC_CHANNELS.APP.MINIMIZE, (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        win?.minimize();
    });

    ipcMain.on(IPC_CHANNELS.APP.MAXIMIZE, (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win?.isMaximized()) {
            win.unmaximize();
        } else {
            win?.maximize();
        }
    });

    ipcMain.on(IPC_CHANNELS.APP.CLOSE, (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        win?.close();
    });

    ipcMain.handle(IPC_CHANNELS.VIDEO.PROCESS, async (event, request) => {
        logger.info('[IPC] Received video:process request', request);

        try {
            // Spawn the worker as a utility process
            const workerPath = path.join(__dirname, 'workers/video-worker.js');
            logger.info('[IPC] Forking worker at:', workerPath);

            const child = utilityProcess.fork(workerPath);

            child.on('spawn', () => {
                logger.info('[IPC] Worker process spawned successfully');
            });

            child.postMessage({ type: 'start', data: request });

            child.on('message', (message: WorkerMessage) => {
                logger.debug('[IPC] Received message from worker:', message.type);
                if (message.type === 'progress') {
                    event.sender.send(IPC_CHANNELS.VIDEO.EXTRACTION_PROGRESS, message.data);
                } else if (message.type === 'complete') {
                    logger.info('[IPC] Worker reported completion');
                    event.sender.send(IPC_CHANNELS.VIDEO.EXTRACTION_COMPLETE, message.data);
                    child.kill();
                } else if (message.type === 'error') {
                    logger.error('[IPC] Worker reported error:', message.data);
                    event.sender.send(IPC_CHANNELS.VIDEO.EXTRACTION_ERROR, message.data);
                    child.kill();
                }
            });

            child.on('exit', (code) => {
                logger.info(`[IPC] Worker process exited with code: ${code}`);
            });

            return { status: 'started' };
        } catch (error) {
            logger.error('[IPC] Failed to start worker:', error);
            throw error;
        }
    });
}
