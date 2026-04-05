import { ChevronDown, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QueueSnapshot } from '@/types/ops';

const QUEUE_ORDER = ['aria-core', 'aria-pulse', 'aria-vera', 'aria-sentinel', 'aria-nexus', 'aria-echo'] as const;

const QUEUE_FRIENDLY: Record<string, string> = {
    'aria-core': 'Main assistant',
    'aria-sentinel': 'Monitoring',
    'aria-nexus': 'Operations',
    'aria-pulse': 'Pricing',
    'aria-vera': 'Loyalty',
    'aria-echo': 'Social & reviews',
};

function shortQueue(name: string): string {
    return name.replace(/^aria-/, '');
}

export function QueueOpsStrip({ snapshot }: { snapshot: QueueSnapshot | null | undefined }) {
    if (!snapshot) {
        return null;
    }

    const { connection, pendingByQueue, pendingTotal, failedLast24h } = snapshot;
    const isSync = connection === 'sync';
    const hasWork = pendingTotal > 0;
    const hasProblems = failedLast24h > 0;

    const headline = isSync
        ? 'Background tasks: running in the same step as the website'
        : hasProblems
          ? `Background tasks: ${failedLast24h} need IT attention (last 24h)`
          : hasWork
            ? `Background tasks: ${pendingTotal} waiting in line`
            : 'Background tasks: all caught up — nothing waiting';

    const subline = isSync
        ? 'For demos with a visible “task list,” your technical contact can switch on background mode. Day-to-day, this is normal.'
        : 'These are small jobs ARIA runs after you click something or when a schedule fires. Zero waiting means the system is keeping up.';

    return (
        <div
            className={cn(
                'overflow-hidden rounded-sm border px-3 py-2',
                isSync ? 'border-amber-500/40 bg-amber-500/8 dark:bg-amber-500/10' : 'border-border bg-muted/20',
                hasProblems && !isSync ? 'border-destructive/40 bg-destructive/8' : null,
            )}
        >
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-foreground flex items-start gap-2 text-sm font-medium leading-snug">
                        <Cpu className="text-foreground/65 mt-0.5 size-3.5 shrink-0 stroke-[1.75]" aria-hidden />
                        <span>{headline}</span>
                    </p>
                    <p className="text-muted-foreground pl-[22px] text-[11px] leading-snug">{subline}</p>
                </div>
                {!isSync && (hasWork || hasProblems) ? (
                    <span
                        className="bg-primary size-2 shrink-0 rounded-sm"
                        aria-hidden
                        title="Work in queue"
                    />
                ) : null}
            </div>

            {!isSync ? (
                <details className="group/details border-border/40 mt-2 border-t pt-1.5">
                    <summary className="text-muted-foreground flex cursor-pointer list-none items-center gap-1 text-xs font-medium [&::-webkit-details-marker]:hidden">
                        <ChevronDown className="size-3.5 shrink-0 group-open/details:rotate-180" />
                        Details for IT / developers
                    </summary>
                    <div className="text-muted-foreground mt-2 space-y-2 text-[11px] leading-relaxed">
                        <p>
                            Connection: <code className="text-foreground bg-muted/60 rounded px-1 py-0.5 font-mono">{connection}</code>
                        </p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono tabular-nums">
                            {QUEUE_ORDER.map((q) => {
                                const n = pendingByQueue[q] ?? 0;
                                const nice = QUEUE_FRIENDLY[q] ?? shortQueue(q);

                                return (
                                    <span key={q} className={cn(n > 0 ? 'text-foreground font-medium' : '')} title={q}>
                                        {nice}: {n}
                                    </span>
                                );
                            })}
                        </div>
                        <p className={cn(hasProblems ? 'text-destructive font-medium' : '')}>
                            Failed jobs (24h): {failedLast24h}
                        </p>
                    </div>
                </details>
            ) : null}
        </div>
    );
}
