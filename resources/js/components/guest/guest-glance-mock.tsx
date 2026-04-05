import { MOCK_GLANCE } from '@/components/guest/guest-mock-data';
import { cn } from '@/lib/utils';
import { Calendar, Clock, CloudSun, UtensilsCrossed, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';

function formatClock(d: Date): string {
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDate(d: Date): string {
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function GuestGlanceMock({
    className,
    scrollRegionClassName,
}: {
    className?: string;
    scrollRegionClassName?: string;
}) {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const t = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(t);
    }, []);

    return (
        <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col', className)}>
            <div className="mb-3 shrink-0">
                <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-[0.2em]">At a glance</p>
                <h2 className="text-foreground mt-1 text-sm font-semibold text-balance">Today & more</h2>
                <p className="text-muted-foreground mt-0.5 text-xs">
                    Resort snapshot — Hermes uses the same context when guests call or chat.
                </p>
            </div>
            <div
                className={cn(
                    'border-border bg-muted/30 flex flex-col gap-0 rounded-xl border',
                    scrollRegionClassName
                        ? cn('shrink-0 overflow-y-auto overscroll-y-contain', scrollRegionClassName)
                        : 'min-h-0 flex-1 overflow-y-auto overscroll-y-contain',
                )}
            >
                <div className="p-4">
                    <div className="text-muted-foreground mb-1 flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider">
                        <Clock className="size-3.5 shrink-0" aria-hidden />
                        Local time
                    </div>
                    <p className="text-foreground font-mono text-2xl font-semibold tabular-nums tracking-tight">
                        {formatClock(now)}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">{formatDate(now)}</p>
                </div>

                <div className="border-border border-t px-4 py-4">
                    <div className="text-muted-foreground mb-1 flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider">
                        <CloudSun className="size-3.5 shrink-0" aria-hidden />
                        Weather
                    </div>
                    <p className="text-foreground text-sm leading-snug">{MOCK_GLANCE.weatherLine}</p>
                </div>

                <div className="border-border border-t px-4 py-4">
                    <div className="text-muted-foreground mb-1 flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider">
                        <UtensilsCrossed className="size-3.5 shrink-0" aria-hidden />
                        Dining
                    </div>
                    <p className="text-foreground text-sm leading-snug">{MOCK_GLANCE.diningLine}</p>
                </div>

                <div className="border-border border-t px-4 py-4">
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Hours</p>
                    <p className="text-foreground mt-1 text-sm leading-snug">{MOCK_GLANCE.hoursLine}</p>
                </div>

                <div className="border-border border-t px-4 py-4">
                    <div className="text-muted-foreground mb-1 flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider">
                        <Wifi className="size-3.5 shrink-0" aria-hidden />
                        Wi‑Fi
                    </div>
                    <p className="text-foreground font-mono text-sm">{MOCK_GLANCE.wifiName}</p>
                    <p className="text-muted-foreground mt-1 text-xs">{MOCK_GLANCE.wifiHint}</p>
                </div>

                <div className="border-border border-t px-4 py-4">
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Emergency & front desk</p>
                    <p className="text-foreground mt-1 text-sm leading-snug">{MOCK_GLANCE.emergencyLine}</p>
                </div>

                <div className="border-border border-t px-4 py-4">
                    <div className="text-muted-foreground mb-2 flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider">
                        <Calendar className="size-3.5 shrink-0" aria-hidden />
                        On today
                    </div>
                    <ul className="space-y-2.5">
                        {MOCK_GLANCE.events.map((e) => (
                            <li key={e.id} className="flex flex-col gap-0.5 border-l-2 border-primary/50 pl-3">
                                <span className="text-foreground text-sm font-medium">{e.title}</span>
                                <span className="text-muted-foreground text-xs">{e.time}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="border-border mt-auto border-t px-4 py-4">
                    <p className="text-muted-foreground text-xs italic">{MOCK_GLANCE.tagline}</p>
                </div>
            </div>
        </div>
    );
}
