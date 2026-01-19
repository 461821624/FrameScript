import log from 'electron-log';

log.transports.file.level = 'info';
export const logger = {
    info: (message: string, ...args: any[]) => log.info(message, ...args),
    error: (message: string, ...args: any[]) => log.error(message, ...args),
    warn: (message: string, ...args: any[]) => log.warn(message, ...args),
    debug: (message: string, ...args: any[]) => log.debug(message, ...args),
};

export default logger;
