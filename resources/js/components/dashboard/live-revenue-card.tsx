import { useEffect, useRef, useState } from 'react';
import { useRevenueStore } from '@/app/store/useRevenueStore';
import { Card } from '@/components/ui/card';
import { formatCurrencyETB } from '@/lib/formatters';

export function LiveRevenueCard() {
    const totalRevenue = useRevenueStore((state) => state.totalRevenue);
    const [animatedValue, setAnimatedValue] = useState(totalRevenue);
    const previousValue = useRef(totalRevenue);

    useEffect(() => {
        let frame = 0;
        const startValue = previousValue.current;
        const start = performance.now();
        const duration = 350;

        const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            setAnimatedValue(startValue + (totalRevenue - startValue) * progress);

            if (progress < 1) {
                frame = requestAnimationFrame(tick);
            }
        };

        frame = requestAnimationFrame(tick);
        previousValue.current = totalRevenue;

        return () => cancelAnimationFrame(frame);
    }, [totalRevenue]);

    return (
        <Card className="bg-background border-muted rounded-xl p-4 shadow-sm">
            <div className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">Live Revenue Impact</div>
            <div className="text-2xl font-semibold">{formatCurrencyETB(Math.round(animatedValue))}</div>
        </Card>
    );
}
