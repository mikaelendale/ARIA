import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { ChartContainer } from '@/components/ui/chart';
import type { RevenueDailyPoint, RevenueSegment } from '@/types/revenue';

const CHART_COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
];

function formatCompact(n: number, currency: string): string {
    if (n >= 1_000_000) {
        return `${(n / 1_000_000).toFixed(1)}M ${currency}`;
    }

    if (n >= 1000) {
        return `${(n / 1000).toFixed(0)}k ${currency}`;
    }

    return `${Math.round(n)} ${currency}`;
}

type AreaProps = {
    data: RevenueDailyPoint[];
    currency: string;
};

export function RevenueTrendChart({ data, currency }: AreaProps) {
    return (
        <ChartContainer>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="4 4" />
                <XAxis dataKey="shortLabel" tickLine={false} axisLine={false} interval={4} minTickGap={16} />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={56}
                    tickFormatter={(v) => formatCompact(Number(v), '')}
                />
                <Tooltip
                    content={({ active, payload, label }) => {
                        if (!active || !payload?.length) {
                            return null;
                        }

                        const row = payload[0]?.payload as RevenueDailyPoint | undefined;

                        return (
                            <div className="border-border/60 bg-background/95 rounded-lg border px-3 py-2 shadow-md backdrop-blur-sm">
                                <p className="text-muted-foreground text-[11px] font-medium">{label}</p>
                                <p className="text-foreground text-sm font-semibold tabular-nums">
                                    {formatCompact(Number(payload[0]?.value), currency)}
                                </p>
                                {row?.event ? (
                                    <p className="text-chart-4 mt-1 max-w-[220px] text-[11px] leading-snug">{row.event}</p>
                                ) : null}
                            </div>
                        );
                    }}
                />
                <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fill="url(#revenueFill)"
                    dot={false}
                    activeDot={{ r: 4, fill: 'var(--chart-1)' }}
                />
            </AreaChart>
        </ChartContainer>
    );
}

type BarProps = {
    segments: RevenueSegment[];
    currency: string;
};

export function RevenueMixChart({ segments, currency }: BarProps) {
    const chartData = segments.map((s) => ({
        ...s,
        labelShort: s.label.replace(' & ', ' + '),
    }));

    return (
        <ChartContainer className="h-[280px]">
            <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                <CartesianGrid horizontal={false} strokeDasharray="4 4" />
                <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatCompact(Number(v), '')}
                />
                <YAxis
                    type="category"
                    dataKey="labelShort"
                    width={120}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                />
                <Tooltip
                    content={({ active, payload }) => {
                        if (!active || !payload?.length) {
                            return null;
                        }

                        const p = payload[0]?.payload as RevenueSegment;

                        return (
                            <div className="border-border/60 bg-background/95 rounded-lg border px-3 py-2 shadow-md backdrop-blur-sm">
                                <p className="text-foreground text-sm font-medium">{p.label}</p>
                                <p className="text-muted-foreground text-xs tabular-nums">
                                    {formatCompact(p.amount, currency)}
                                </p>
                            </div>
                        );
                    }}
                />
                <Bar dataKey="amount" radius={[0, 6, 6, 0]} barSize={22}>
                    {chartData.map((_, i) => (
                        <Cell key={chartData[i].key} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ChartContainer>
    );
}
