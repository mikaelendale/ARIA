import { Card } from '@/components/ui/card';
import { formatCompactNumber, formatCurrencyETB } from '@/lib/formatters';

interface TopStatsBarProps {
    guests: number;
    incidentsOpen: number;
    resolvedToday: number;
    revenue: number;
}

export function TopStatsBar({ guests, incidentsOpen, resolvedToday, revenue }: TopStatsBarProps) {
    const items = [
        { label: 'Active Guests', value: formatCompactNumber(guests) },
        { label: 'Open Incidents', value: formatCompactNumber(incidentsOpen) },
        { label: 'Resolved Today', value: formatCompactNumber(resolvedToday) },
        { label: 'Revenue Impact', value: formatCurrencyETB(revenue) },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {items.map((item) => (
                <Card key={item.label} className="bg-background border-muted rounded-xl p-4 shadow-sm">
                    <div className="text-muted-foreground text-xs uppercase tracking-wide">{item.label}</div>
                    <div className="mt-1 text-xl font-semibold">{item.value}</div>
                </Card>
            ))}
        </div>
    );
}
