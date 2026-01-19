import { ipcMain, BrowserWindow, dialog, app } from 'electron';
import { IPC_CHANNELS } from './constants';
import { registerProjectHandlers } from './project-handlers';

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
}
