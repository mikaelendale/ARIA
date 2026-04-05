import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type AriaChatMessage = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
};

type Props = {
    messages: AriaChatMessage[];
    /** True while the stream is open and assistant reply is not finished. */
    isGenerating?: boolean;
    onBack: () => void;
    emptyHint?: string;
    className?: string;
};

export function AriaChatPanel({
    messages,
    isGenerating = false,
    onBack,
    emptyHint,
    className,
}: Props) {
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isGenerating]);

    return (
        <div className={cn('flex min-h-0 w-full min-w-0 flex-1 flex-col', className)}>
            <div className=" flex shrink-0 items-center gap-2  px-1 pb-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    className="text-muted-foreground hover:text-foreground -ml-2 gap-1.5"
                >
                    <ArrowLeft className="size-4 shrink-0 stroke-[1.75]" aria-hidden />
                    Overview
                </Button>
                <span className="text-muted-foreground text-[10px] font-semibold tracking-[0.2em] uppercase">
                    ARIA
                </span>
            </div>

            <div
                className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-y-contain px-1 py-3 pr-2 [-webkit-overflow-scrolling:touch]"
                role="log"
                aria-live="polite"
            >
                {messages.length === 0 ? (
                    <p className="text-muted-foreground px-2 py-10 text-center text-sm leading-relaxed">
                        {emptyHint ?? 'Ask anything about your resort. Your conversation stays on this page.'}
                    </p>
                ) : (
                    messages.map((m) => {
                        const isPendingAssistant =
                            m.role === 'assistant' && m.content.trim() === '' && isGenerating;

                        return (
                            <motion.div
                                key={m.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                                className={cn(
                                    'max-w-[min(100%,28rem)] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap shadow-sm',
                                    m.role === 'user'
                                        ? 'bg-primary text-primary-foreground ml-auto'
                                        : 'bg-muted/90 text-foreground border-border/40 mr-auto border',
                                )}
                            >
                                {isPendingAssistant ? (
                                    <span className="text-muted-foreground inline-flex items-center gap-2">
                                        <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
                                        <span>Generating…</span>
                                    </span>
                                ) : (
                                    m.content
                                )}
                            </motion.div>
                        );
                    })
                )}
                <div ref={endRef} className="h-px shrink-0" aria-hidden />
            </div>
        </div>
    );
}
