/**
 * Safely parse JSON from LLM responses, handling markdown code blocks and common artifacts.
 */
export function safeParseJson<T = any>(text: string, fallback: T = {} as T): T {
    if (!text || typeof text !== 'string') return fallback;

    let cleanText = text.trim();

    // 1. Remove markdown code blocks (e.g., ```json ... ``` or ``` ... ```)
    // Multiline regex to find the content between backticks
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
    const match = cleanText.match(codeBlockRegex);
    if (match && match[1]) {
        cleanText = match[1].trim();
    }

    // 2. If it still looks like it has trailing/leading junk (sometimes LLMs add extra text)
    // Try to find the first '{' or '[' and the last '}' or ']'
    const firstBrace = cleanText.indexOf('{');
    const firstBracket = cleanText.indexOf('[');
    const lastBrace = cleanText.lastIndexOf('}');
    const lastBracket = cleanText.lastIndexOf(']');

    let start = -1;
    let end = -1;

    // Determine if it's likely an object or an array
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        start = firstBrace;
        end = lastBrace;
    } else if (firstBracket !== -1) {
        start = firstBracket;
        end = lastBracket;
    }

    if (start !== -1 && end !== -1 && end > start) {
        cleanText = cleanText.substring(start, end + 1);
    }

    try {
        return JSON.parse(cleanText);
    } catch (e) {
        console.error('[safeParseJson] Failed to parse clean text:', cleanText);
        console.error('[safeParseJson] Original text was:', text);
        return fallback;
    }
}
