import { ai } from './index';
import { SCRIPT_PROMPT } from './prompts/script';
import { VisionResult, ScriptResult } from './types';
import { safeParseJson } from './utils/json';

interface VideoSegmentInput {
    sourceId: string;
    frames: {
        time: number;
        vision: VisionResult;
    }[];
    duration?: number;
}

export async function generateVideoScript(input: {
    topic?: string;
    style?: string;
    videos: VideoSegmentInput[];
}): Promise<ScriptResult> {
    const { topic, style, videos } = input;

    const videosText = videos.map((v, vIdx) => {
        const framesText = v.frames.map((f, fIdx) => {
            return `  - [片段 ${fIdx + 1} | ${f.time}s]: ${f.vision.message} (场景: ${f.vision.scene}, 情绪: ${f.vision.emotion})`;
        }).join('\n');

        return `
【素材 ${vIdx + 1} | ID: ${v.sourceId}】
${framesText}
`;
    }).join('\n');

    const stylePrompt = style ? `\n【文案风格偏好】\n${style}\n` : '';

    const userPrompt = `
【视频主题】
${topic ?? '未指定'}
${stylePrompt}

【输入素材分析集】
${videosText}
`;

    const result = await ai.generateText({
        prompt: SCRIPT_PROMPT + '\n' + userPrompt,
        temperature: 0.7
    });

    return safeParseJson(result);
}