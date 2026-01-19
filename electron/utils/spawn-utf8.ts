import { spawn, SpawnOptionsWithoutStdio, ChildProcessWithoutNullStreams } from 'child_process';

/**
 * UTF-8 安全的 spawn 封装
 * - 强制 stdout / stderr 使用 UTF-8
 * - 统一 Windows / macOS / Linux 行为
 * - 适合 FFmpeg / Worker / CLI 工具
 */
export function spawnUTF8(
    command: string,
    args: string[] = [],
    options: SpawnOptionsWithoutStdio = {}
): ChildProcessWithoutNullStreams {
    const child = spawn(command, args, {
        ...options,
        stdio: 'pipe',
        windowsHide: true,
        env: {
            ...process.env,

            // ✅ 强制 UTF-8（关键）
            LANG: 'zh_CN.UTF-8',
            LC_ALL: 'zh_CN.UTF-8',
            LC_CTYPE: 'zh_CN.UTF-8',

            // 某些工具（Python / FFmpeg wrapper）会读这个
            PYTHONIOENCODING: 'utf-8',

            ...options.env
        }
    });

    // ✅ 明确指定编码（防止 Windows 默认 GBK）
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');

    return child;
}
