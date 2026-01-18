// electron/ai/providers/mock.ts

import { BaseAIClient } from '../client';
import { VisionResult } from '../types';

export class MockAIClient extends BaseAIClient {
    async analyzeImage(): Promise<VisionResult> {
        return {
            scene: '室内',
            subject: '人物',
            action: '日常活动',
            emotion: '平静',
            message: '日常 vlog 片段',
            value: 0.5
        };
    }

    async generateText(): Promise<string> {
        return JSON.stringify({
            title: 'Mock 视频标题',
            hook: '这是一个吸引人的开头钩子！',
            segments: [
                {
                    id: 'mock-1',
                    sourceId: 'placeholder',
                    text: '这是第一段 Mock 生成的剧本文案，对应第一个画面流。',
                    locked: false
                },
                {
                    id: 'mock-2',
                    sourceId: 'placeholder',
                    text: '这是第二段 Mock 文案，展示了转场后的内容。',
                    locked: false
                }
            ],
            ending: '感谢收看，我们下期再见！',
            hashtags: ['Mock', '测试', 'Vlog']
        });
    }
}