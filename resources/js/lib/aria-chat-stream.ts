export type AriaStreamCallbacks = {
    onTextDelta: (delta: string) => void;
    onConversationId?: (conversationId: string) => void;
};

/**
 * Consumes Laravel AI SSE (Vercel UI protocol + custom `data-aria-conversation` line).
 */
export async function consumeAriaChatSseStream(
    stream: ReadableStream<Uint8Array>,
    { onTextDelta, onConversationId }: AriaStreamCallbacks,
): Promise<void> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            buffer += decoder.decode(value, { stream: true });

            let sep: number;
            while ((sep = buffer.indexOf('\n\n')) !== -1) {
                const block = buffer.slice(0, sep);
                buffer = buffer.slice(sep + 2);

                for (const line of block.split('\n')) {
                    if (!line.startsWith('data:')) {
                        continue;
                    }
                    const raw = line.slice(5).trim();
                    if (raw === '[DONE]') {
                        continue;
                    }
                    try {
                        const obj = JSON.parse(raw) as {
                            type?: string;
                            delta?: string;
                            conversationId?: string;
                        };
                        if (obj.type === 'text-delta' && typeof obj.delta === 'string') {
                            onTextDelta(obj.delta);
                        }
                        if (obj.type === 'data-aria-conversation' && typeof obj.conversationId === 'string') {
                            onConversationId?.(obj.conversationId);
                        }
                    } catch {
                        /* ignore malformed JSON lines */
                    }
                }
            }
        }
    } finally {
        reader.releaseLock();
    }
}
