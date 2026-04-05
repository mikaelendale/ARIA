import { MOCK_GLANCE } from '@/components/guest/guest-mock-data';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

function formatClock(d: Date): string {
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDate(d: Date): string {
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function GuestGlanceMock({ className }: { className?: string }) {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const t = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(t);
    }, []);

    return (
        <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col', className)}>
            <div className="mb-3 shrink-0">
                <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-[0.2em]">At a glance</p>
                <h2 className="text-foreground mt-1 text-sm font-semibold text-balance">Today</h2>
            </div>
            <div className="border-border bg-muted/30 flex flex-1 flex-col gap-4 rounded-xl border p-4">
                <div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Local time</p>
                    <p className="text-foreground mt-1 font-mono text-2xl font-semibold tabular-nums tracking-tight">
                        {formatClock(now)}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">{formatDate(now)}</p>
                </div>
                <div className="border-border border-t pt-4">
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Weather</p>
                    <p className="text-foreground mt-1 text-sm leading-snug">{MOCK_GLANCE.weatherLine}</p>
                </div>
                <div className="border-border border-t pt-4">
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Hours</p>
                    <p className="text-foreground mt-1 text-sm leading-snug">{MOCK_GLANCE.hoursLine}</p>
                </div>
                <div className="border-border mt-auto border-t pt-4">
                    <p className="text-muted-foreground text-xs italic">{MOCK_GLANCE.tagline}</p>
                </div>
            </div>
        </div>
    );
}
