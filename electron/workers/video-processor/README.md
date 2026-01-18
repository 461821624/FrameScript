# Video Processor Worker (Standalone)

High-performance video keyframe extraction worker using a two-stage processing model. Perfect for large videos where full decoding is too slow.

## Capabilities
- **Scene Change Detection**: Automatically finds visual transitions.
- **Interval Fallback**: Ensures a frame is taken at least every X seconds.
- **Two-Stage Model**: 
    - **Stage 1 (Fast Scan)**: Scans the file without full decoding to identify timestamps.
    - **Stage 2 (Precision Extraction)**: Rapidly seeks and extracts high-quality frames.

## Prerequisites
The worker requires **FFmpeg**. We have configured it to:
1.  Use the built-in `@ffmpeg-installer/ffmpeg` package (Recommended).
2.  Use a custom path via `FFMPEG_PATH` environment variable.
3.  Fallback to a global `ffmpeg` in your system PATH.

## Installation & Running

### 1. Direct Test (NPM Package mode)
No system installation required if you use `tsx`:
```bash
npx tsx d:\FrameScript\electron\workers\video-processor\index.ts <input_video_path> [output_directory]
```

### 2. Example with custom FFmpeg path
If you want to use a specific version:
```bash
# Windows (PowerShell)
$env:FFMPEG_PATH="C:\ffmpeg\bin\ffmpeg.exe"
npx tsx d:\FrameScript\electron\workers\video-processor\index.ts my_video.mp4 ./results
```

## Directory Structure & Output
```text
output/
 ├─ frames/              # Extracted high-quality JPGs
 │   ├─ frame_0001.jpg
 │   └─ ...
 └─ frames.json         # Complete metadata
```

### frames.json Structure
```json
{
  "video": "my_video.mp4",
  "duration": 120.5,
  "frames": [
    { "time": 3.2, "file": "frames/frame_0001.jpg", "source": "scene" },
    { "time": 6.0, "file": "frames/frame_0002.jpg", "source": "interval" }
  ]
}
```

## Troubleshooting & Failure Cases

| Error | Cause | Solution |
| :--- | :--- | :--- |
| `ENOENT` / `FFmpeg not found` | FFmpeg is missing | Check `FFMPEG_PATH` or run `npm install` for the project. |
| `Fast scan failed` | Video is corrupt | Verify the video plays in a standard player. |
| `Permission denied` | No write access to output | Ensure you have permissions for the destination directory. |
| `Seek failed` | Precision seeking error | Ensure the input file supports seeking (most mp4/mov do). |

## Implementation Details
- **Command Construction**:
    - Fast Scan: `-vf "select='...',showinfo" -f null -`
    - Extraction: `-ss <time> -i <input> -vframes 1` (Seek-before-input for sub-second lookup).
