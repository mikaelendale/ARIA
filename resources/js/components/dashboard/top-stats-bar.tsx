import { Card } from '@/components/ui/card';
import { formatCompactNumber, formatCurrencyETB } from '@/lib/formatters';

interface TopStatsBarProps {
    guests: number;
    incidentsOpen: number;
    resolvedToday: number;
    occupancyPercent: number;
    revenue: number;
}

export function TopStatsBar({
    guests,
    incidentsOpen,
    resolvedToday,
    occupancyPercent,
    revenue,
}: TopStatsBarProps) {
    const items = [
        { label: 'Active guests', value: formatCompactNumber(guests) },
        { label: 'Open incidents', value: formatCompactNumber(incidentsOpen) },
        { label: 'Resolved today', value: formatCompactNumber(resolvedToday) },
        { label: 'Occupancy', value: `${occupancyPercent}%` },
        { label: 'Revenue impact (today)', value: formatCurrencyETB(revenue) },
    ];

    return (
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-5">
            {items.map((item, i) => (
                <Card
                    key={item.label}
                    className="aria-animate-in border-border/40 bg-muted/10 rounded-md border px-3 py-2.5 shadow-none"
                    style={{ animationDelay: `${i * 55}ms` }}
                >
                    <div className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.18em]">
                        {item.label}
                    </div>
                    <div className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight">{item.value}</div>
                </Card>
            ))}
        </div>
    );
}
