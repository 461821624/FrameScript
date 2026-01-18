/**
 * Simple rate limiter and retry utility for API requests.
 * Specifically designed to handle the Gemini Free Tier limit (5 RPM).
 */
export class RateLimiter {
    private queue: (() => Promise<void>)[] = [];
    private processing = false;
    private lastRequestTime = 0;
    private minInterval: number;
    private maxRetries: number;
    private retryDelay: number;

    constructor(options: {
        requestsPerMinute?: number;
        maxRetries?: number;
        retryDelay?: number;
    } = {}) {
        const rpm = options.requestsPerMinute || 5;
        this.minInterval = (60 / rpm) * 1000 + 500; // Add 500ms safety margin
        this.maxRetries = options.maxRetries || 3;
        this.retryDelay = options.retryDelay || 2000;
    }

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                let attempts = 0;
                while (attempts <= this.maxRetries) {
                    try {
                        await this.waitIfNeeded();
                        const result = await fn();
                        this.lastRequestTime = Date.now();
                        resolve(result);
                        return;
                    } catch (error: any) {
                        attempts++;

                        // Check for rate limit error (429) fully
                        const errorMsg = error?.message || '';
                        const isDailyLimit = errorMsg.includes('Daily quota') || errorMsg.includes('Quota exceeded');
                        const isRateLimitError = error?.status === 'RESOURCE_EXHAUSTED' ||
                            error?.message?.includes('429') ||
                            error?.code === 429;

                        if (isDailyLimit) {
                            reject(new Error(`[AI] 今日免费配额已耗尽，请稍后再试或更换 API Key。`));
                            return;
                        }

                        if (isRateLimitError && attempts <= this.maxRetries) {
                            const delay = this.retryDelay * Math.pow(2, attempts - 1);
                            console.warn(`[RateLimiter] Rate limit exceeded (429). Retrying attempt ${attempts} after ${delay}ms...`);
                            await new Promise(r => setTimeout(r, delay));
                            continue;
                        }

                        reject(error);
                        return;
                    }
                }
            });

            this.processQueue();
        });
    }

    private async waitIfNeeded() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minInterval) {
            const waitTime = this.minInterval - timeSinceLastRequest;
            await new Promise(r => setTimeout(r, waitTime));
        }
    }

    private async processQueue() {
        if (this.processing || this.queue.length === 0) return;
        this.processing = true;

        while (this.queue.length > 0) {
            const task = this.queue.shift();
            if (task) {
                await task();
            }
        }

        this.processing = false;
    }
}
