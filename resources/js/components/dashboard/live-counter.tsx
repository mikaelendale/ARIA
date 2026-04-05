import { useEffect, useRef, useState } from 'react';
import { usePulseRevenueStore } from '@/app/store/usePulseRevenueStore';
import { Card } from '@/components/ui/card';
import { formatCurrencyETB } from '@/lib/formatters';

function easeOutCubic(t: number): number {
    return 1 - (1 - t) ** 3;
}

export function LiveCounter() {
    const pulseRevenueToday = usePulseRevenueStore((s) => s.pulseRevenueToday);
    const [animatedValue, setAnimatedValue] = useState(pulseRevenueToday);
    const previousValue = useRef(pulseRevenueToday);

    useEffect(() => {
        let frame = 0;
        const startValue = previousValue.current;
        const start = performance.now();
        const duration = 120;

        const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = easeOutCubic(progress);
            setAnimatedValue(startValue + (pulseRevenueToday - startValue) * eased);

            if (progress < 1) {
                frame = requestAnimationFrame(tick);
            }
        };

        frame = requestAnimationFrame(tick);
        previousValue.current = pulseRevenueToday;

        return () => cancelAnimationFrame(frame);
    }, [pulseRevenueToday]);

    return (
        <Card className="border-border bg-muted/20 rounded-sm border p-3 shadow-none">
            <div className="text-muted-foreground mb-0.5 text-xs font-semibold uppercase tracking-[0.18em]">
                Extra revenue today (pricing)
            </div>
            <p className="text-muted-foreground mb-1 text-[11px] leading-snug">
                Rough ETB linked to pricing and promo moves. Not your full P&amp;L.
            </p>
            <div className="text-xl font-semibold tabular-nums tracking-tight">
                {formatCurrencyETB(Math.round(animatedValue))}
            </div>
        </Card>
    );
}
