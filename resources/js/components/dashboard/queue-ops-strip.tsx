import type { QueueSnapshot } from '@/types/ops';
import { cn } from '@/lib/utils';

const QUEUE_ORDER = ['aria-core', 'aria-sentinel', 'aria-nexus', 'aria-pulse', 'aria-vera', 'aria-echo'] as const;

function shortQueue(name: string): string {
    return name.replace(/^aria-/, '');
}

export function QueueOpsStrip({ snapshot }: { snapshot: QueueSnapshot | null | undefined }) {
    if (!snapshot) {
        return null;
    }

    const { connection, pendingByQueue, pendingTotal, failedLast24h } = snapshot;
    const isSync = connection === 'sync';
    const hasPulse = pendingTotal > 0 || failedLast24h > 0;

    return (
        <div
            className={cn(
                'aria-animate-in overflow-hidden rounded-lg border px-3 py-2',
                isSync ? 'border-amber-500/35 bg-amber-500/5' : 'border-border/50 bg-muted/10',
            )}
            style={{ animationDelay: '30ms' }}
        >
            <div className="text-muted-foreground mb-1.5 flex flex-wrap items-center justify-between gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase">
                <span className="inline-flex items-center gap-2">
                    {hasPulse ? <span className="aria-live-dot size-1.5 rounded-full bg-emerald-500" /> : null}
                    Queue & workers
                </span>
                <span className="text-foreground/80 font-mono normal-case tracking-normal">
                    {connection}
                    {isSync ? ' · inline (no worker visibility)' : ''}
                </span>
            </div>
            {isSync ? (
                <p className="text-muted-foreground text-xs leading-snug">
                    Set <code className="text-foreground bg-muted/50 rounded px-1 py-0.5 font-mono text-[11px]">QUEUE_CONNECTION=database</code> or{' '}
                    <code className="text-foreground bg-muted/50 rounded px-1 py-0.5 font-mono text-[11px]">redis</code> and run{' '}
                    <code className="font-mono text-[11px]">queue:work</code> so judges see pending jobs drain.
                </p>
            ) : (
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-mono text-[11px] leading-relaxed tabular-nums">
                    <span className="flex flex-wrap gap-x-3 gap-y-1">
                        {QUEUE_ORDER.map((q) => {
                            const n = pendingByQueue[q] ?? 0;

                            return (
                                <span key={q} className={cn(n > 0 ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                                    {shortQueue(q)}:{n}
                                </span>
                            );
                        })}
                    </span>
                    <span className={cn(failedLast24h > 0 ? 'text-destructive shrink-0' : 'text-muted-foreground shrink-0')}>
                        failed24h:{failedLast24h}
                    </span>
                </div>
            )}
        </div>
    );
}
