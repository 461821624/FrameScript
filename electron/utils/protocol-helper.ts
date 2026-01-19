import { net } from 'electron';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import { logger } from './logger';

export function handleAtomProtocol(request: Request): Response | Promise<Response> {
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
        // Security check: ensure file exists
        if (!fs.existsSync(filePath)) {
            logger.warn(`[Protocol] 404: ${request.url} -> ${filePath}`);
            return new Response('File Not Found', { status: 404 });
        }

        return net.fetch(pathToFileURL(filePath).toString());
    } catch (error) {
        logger.error(`[Protocol] Error for ${request.url}:`, error);
        return new Response('Protocol Error', { status: 500 });
    }
}
