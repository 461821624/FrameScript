import { fileURLToPath } from 'url';
import path from 'path';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

// @ts-ignore
globalThis.__dirname = _dirname;
// @ts-ignore
globalThis.__filename = _filename;
