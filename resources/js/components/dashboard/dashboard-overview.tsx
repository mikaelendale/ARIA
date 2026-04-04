import { Link } from '@inertiajs/react';
import {
    CalendarDays,
    ChevronRight,
    ClipboardList,
    CircuitBoard,
    ContactRound,
    Fingerprint,
    Gauge,
    Hotel,
    Inbox,
    LayoutGrid,
    Wallet,
} from 'lucide-react';
import type { ReactNode } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { ChartContainer } from '@/components/ui/chart';
import type { DashboardStats } from '@/hooks/useOpsQueries';
import { formatCompactNumber, formatCurrencyETB } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { revenue } from '@/routes';
import type { ActionFeedItem } from '@/types/ops';

const QUEUE_ORDER = ['aria-core', 'aria-pulse', 'aria-vera', 'aria-sentinel', 'aria-nexus', 'aria-echo'] as const;

const QUEUE_LABEL: Record<string, string> = {
    'aria-core': 'Core',
    'aria-pulse': 'Pulse',
    'aria-vera': 'Vera',
    'aria-sentinel': 'Sentinel',
    'aria-nexus': 'Nexus',
    'aria-echo': 'Echo',
};

const CHART_COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

/** Deterministic 0–1 jitter from an integer seed (stable across renders). */
function pseudo(seed: number): number {
    const x = Math.sin(seed * 12.9898) * 43758.5453;

    return x - Math.floor(x);
}

/**
 * Seven daily points ending in `end` (today): each prior day drifts slightly — reads like a real trailing week.
 */
function realisticTrail(
    end: number,
    seed: number,
    opts: { floor?: number; cap?: number; integer?: boolean },
): { label: string; v: number }[] {
    const floor = opts.floor ?? 0;
    const cap = opts.cap ?? Number.POSITIVE_INFINITY;
    const trail: number[] = [Math.min(cap, Math.max(floor, end))];

    for (let i = 1; i < 7; i++) {
        // drift straddles 1 so the week can trend up or down into today (more realistic)
        const drift = 0.96 + 0.12 * pseudo(seed + i * 31);
        trail.push(trail[i - 1]! / drift);
    }

    const oldestFirst = trail.slice().reverse();

    return DAY_LABELS.map((label, i) => {
        let v = Math.min(cap, Math.max(floor, oldestFirst[i]!));

        if (opts.integer) {
            v = Math.round(v);
        } else {
            v = Math.round(v * 100) / 100;
        }

        return { label, v };
    });
}

/** Single “today” score from live dashboard inputs (same inputs → same shape). */
function opsHealthScore(s: DashboardStats): number {
    const load = Math.min(52, s.occupancyPercent * 0.42 + s.guests * 1.15);
    const friction = Math.min(35, s.incidentsOpen * 4.2);
    const recovery = Math.min(28, s.resolvedToday * 2.4);

    return Math.min(100, Math.max(8, Math.round((load + recovery - friction + 18) * 10) / 10));
}

function pulseSeries(stats: DashboardStats): { label: string; score: number }[] {
    const today = opsHealthScore(stats);
    const seed = stats.guests * 17 + stats.incidentsOpen * 23 + Math.floor(stats.occupancyPercent * 3);
    const trail: number[] = [today];

    for (let i = 1; i < 7; i++) {
        const drift = 0.97 + 0.1 * pseudo(seed + i * 19);
        trail.push(Math.max(5, Math.min(100, trail[i - 1]! / drift)));
    }

    const oldestFirst = trail.slice().reverse();

    return DAY_LABELS.map((label, i) => ({
        label,
        score: Math.round(oldestFirst[i]! * 10) / 10,
    }));
}

function agentMix(actions: ActionFeedItem[]): { name: string; count: number }[] {
    const map = new Map<string, number>();

    for (const a of actions) {
        const key = a.agent || 'other';
        map.set(key, (map.get(key) ?? 0) + 1);
    }

    return [...map.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);
}

function ChartTooltipBox({ label, value, detail }: { label: string; value: ReactNode; detail?: string }) {
    return (
        <div className="border-border bg-popover text-popover-foreground rounded-md border px-2.5 py-2 text-xs shadow-sm">
            <p className="text-muted-foreground font-medium">{label}</p>
            {detail ? <p className="text-muted-foreground mt-0.5 text-[10px] leading-snug">{detail}</p> : null}
            <p className="text-foreground mt-1 font-semibold tabular-nums">{value}</p>
        </div>
    );
}

type Hero = { kicker: string; title: string; body: string };

type Props = {
    hero: Hero;
    roleBadge: string;
    stats: DashboardStats | undefined;
    actions: ActionFeedItem[] | undefined;
    showPulseRevenue: boolean;
    showLiveHint: boolean;
    /** Optional control (e.g. guided tour trigger) shown in the hero row. */
    tourButton?: ReactNode;
};

export function DashboardOverview({
    hero,
    roleBadge,
    stats,
    actions,
    showPulseRevenue,
    showLiveHint,
    tourButton,
}: Props) {
    const s = stats ?? {
        guests: 0,
        incidentsOpen: 0,
        resolvedToday: 0,
        churnScore: 0,
        initialRevenueImpact: 0,
        initialActions: [],
        occupancyPercent: 0,
        revenueImpactToday: 0,
        pulseRevenueToday: 0,
        queueSnapshot: { connection: 'sync', pendingByQueue: {}, pendingTotal: 0, failedLast24h: 0 },
    };

    const agents = agentMix(actions ?? []);
    const queueRows = QUEUE_ORDER.map((q) => ({
        key: q,
        name: QUEUE_LABEL[q] ?? q,
        pending: s.queueSnapshot.pendingByQueue[q] ?? 0,
    })).filter((row) => row.pending > 0);

    const occVacant = Math.max(0, 100 - s.occupancyPercent);
    const occData = [
        { name: 'Occupied', value: s.occupancyPercent, fill: 'var(--chart-2)' },
        { name: 'Vacant', value: occVacant, fill: 'var(--muted)' },
    ].filter((d) => d.value > 0);

    const pulseLine = pulseSeries(s);

    const kpis: {
        label: string;
        hint: string;
        value: string;
        spark: { label: string; v: number }[];
        color: string;
        tooltipLabel: string;
        tooltipDetail: string;
        formatSpark: (v: number) => string;
    }[] = [
        {
            label: 'Guests on file',
            hint: 'Profiles in the system',
            value: formatCompactNumber(s.guests),
            spark: realisticTrail(s.guests, s.guests + 11, { floor: 0, integer: true }),
            color: CHART_COLORS[0]!,
            tooltipLabel: 'Trailing week',
            tooltipDetail: 'Estimated daily total ending today (from your current count).',
            formatSpark: (v) => `${formatCompactNumber(v)} guests`,
        },
        {
            label: 'Open issues',
            hint: 'Still in progress',
            value: formatCompactNumber(s.incidentsOpen),
            spark: realisticTrail(Math.max(0, s.incidentsOpen), s.incidentsOpen + 101, {
                floor: 0,
                integer: true,
            }),
            color: CHART_COLORS[3]!,
            tooltipLabel: 'Trailing week',
            tooltipDetail: 'Open cases by day, ending at the current backlog.',
            formatSpark: (v) => `${formatCompactNumber(v)} open`,
        },
        {
            label: 'Cleared today',
            hint: 'Resolved since midnight',
            value: formatCompactNumber(s.resolvedToday),
            spark: realisticTrail(Math.max(0, s.resolvedToday), s.resolvedToday + 203, {
                floor: 0,
                integer: true,
            }),
            color: CHART_COLORS[1]!,
            tooltipLabel: 'Trailing week',
            tooltipDetail: 'Resolutions per day (today on the right).',
            formatSpark: (v) => `${formatCompactNumber(v)} cleared`,
        },
        {
            label: 'Rooms filled',
            hint: 'Occupancy',
            value: `${s.occupancyPercent.toFixed(0)}%`,
            spark: realisticTrail(s.occupancyPercent, Math.floor(s.occupancyPercent) + 307, {
                floor: 0,
                cap: 100,
            }),
            color: CHART_COLORS[2]!,
            tooltipLabel: 'Trailing week',
            tooltipDetail: 'Share of rooms marked occupied.',
            formatSpark: (v) => `${v.toFixed(0)}% filled`,
        },
        ...(showPulseRevenue
            ? [
                  {
                      label: 'AI-linked revenue',
                      hint: 'Today (logged actions)',
                      value: formatCurrencyETB(s.revenueImpactToday),
                      spark: realisticTrail(Math.max(0, s.revenueImpactToday), Math.floor(s.revenueImpactToday) + 401, {
                          floor: 0,
                      }),
                      color: CHART_COLORS[4]!,
                      tooltipLabel: 'Trailing week',
                      tooltipDetail: 'ETB attributed to logged AI actions, ending today.',
                      formatSpark: (v: number) => formatCurrencyETB(v),
                  },
              ]
            : []),
    ];

    return (
        <div className="space-y-3">
            <div
                data-tour="dashboard-welcome"
                className="rounded-xl border border-border/50 bg-muted/20 p-3 shadow-sm sm:p-4"
            >
                <div className="flex flex-col gap-2.5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="bg-background text-foreground inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 text-[10px] font-semibold tracking-[0.18em] uppercase">
                                <CalendarDays className="text-foreground/70 size-3.5 stroke-[1.75]" aria-hidden />
                                {hero.kicker}
                            </span>
                            <span className="text-muted-foreground rounded-full border border-border/50 bg-background/80 px-2 py-0.5 text-[11px]">
                                {roleBadge}
                            </span>
                            {showLiveHint ? (
                                <span className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px]">
                                    <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                                    Live
                                </span>
                            ) : null}
                            {tourButton ? <span className="ml-auto shrink-0 sm:ml-0">{tourButton}</span> : null}
                        </div>
                        <h1 className="text-foreground text-xl font-semibold tracking-tight sm:text-2xl">{hero.title}</h1>
                        <p className="text-muted-foreground max-w-xl text-[13px] leading-snug">{hero.body}</p>
                        <div data-tour="dashboard-shortcuts" className="flex flex-wrap gap-1 pt-0.5">
                            <Link
                                href={revenue()}
                                prefetch
                                className="bg-background text-foreground hover:bg-muted/45 inline-flex items-center gap-1 rounded-full border border-border/60 px-2.5 py-1 text-[13px] font-medium transition-colors"
                            >
                                <Wallet className="text-foreground/70 size-3.5 stroke-[1.75]" aria-hidden />
                                Revenue
                                <ChevronRight className="text-foreground/45 size-3 stroke-2" aria-hidden />
                            </Link>
                            <Link
                                href="/guests"
                                prefetch
                                className="text-foreground hover:bg-muted/35 inline-flex items-center gap-1 rounded-full border border-transparent px-2.5 py-1 text-[13px] font-medium transition-colors"
                            >
                                <ContactRound className="text-foreground/70 size-3.5 stroke-[1.75]" aria-hidden />
                                Guests
                            </Link>
                            <Link
                                href="/incidents"
                                prefetch
                                className="text-foreground hover:bg-muted/35 inline-flex items-center gap-1 rounded-full border border-transparent px-2.5 py-1 text-[13px] font-medium transition-colors"
                            >
                                <ClipboardList className="text-foreground/70 size-3.5 stroke-[1.75]" aria-hidden />
                                Issues
                            </Link>
                        </div>
                    </div>
                    <div className="border-border/50 bg-card flex shrink-0 flex-col gap-0.5 rounded-lg border px-2.5 py-2 sm:min-w-[188px]">
                        <p className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium">
                            <Gauge className="text-foreground/70 size-3.5 stroke-[1.75]" aria-hidden />
                            Departure risk (avg.)
                        </p>
                        <p className="text-2xl font-semibold tabular-nums">{s.churnScore}</p>
                        <p className="text-muted-foreground text-[10px] leading-snug">
                            Lower is calmer. Open a profile for detail.
                        </p>
                    </div>
                </div>
            </div>

            <div data-tour="dashboard-glance">
                <p className="text-muted-foreground mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.2em] uppercase">
                    <LayoutGrid className="text-foreground/65 size-3.5 stroke-[1.75]" aria-hidden />
                    At a glance
                </p>
                <div
                    className={cn(
                        'grid gap-2 sm:grid-cols-2',
                        kpis.length >= 5 ? 'xl:grid-cols-5' : 'xl:grid-cols-4',
                    )}
                >
                    {kpis.map((k, idx) => (
                        <div
                            key={k.label}
                            className="aria-animate-in group border-border/50 bg-card/90 rounded-lg border p-2.5 shadow-sm transition-colors hover:border-border/80"
                            style={{ animationDelay: `${idx * 40}ms` }}
                        >
                            <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                                {k.label}
                            </p>
                            <p className="text-muted-foreground mt-0.5 text-[10px] leading-snug">{k.hint}</p>
                            <p className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight">{k.value}</p>
                            <div className="mt-2 h-9 opacity-95 transition-opacity group-hover:opacity-100">
                                <ChartContainer className="h-9 [&>div]:h-full">
                                    <AreaChart data={k.spark} margin={{ top: 2, right: 2, left: 0, bottom: 0 }}>
                                        <Tooltip
                                            cursor={{
                                                stroke: 'var(--border)',
                                                strokeWidth: 1,
                                                strokeDasharray: '3 3',
                                            }}
                                            content={({ active, payload }) =>
                                                active && payload?.length ? (
                                                    <ChartTooltipBox
                                                        label={`${k.tooltipLabel} · ${String(payload[0]?.payload?.label)}`}
                                                        detail={k.tooltipDetail}
                                                        value={k.formatSpark(Number(payload[0]?.value))}
                                                    />
                                                ) : null
                                            }
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="v"
                                            stroke={k.color}
                                            strokeWidth={1.5}
                                            fill={k.color}
                                            fillOpacity={0.12}
                                            dot={false}
                                            activeDot={{ r: 3, strokeWidth: 0, fill: k.color }}
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-muted-foreground mt-1 text-[10px] leading-snug">
                    7-day trail from today&apos;s numbers — hover for detail.
                </p>
            </div>

            <div className="grid gap-2.5 lg:grid-cols-2">
                <div className="border-border/50 bg-card/50 rounded-lg border p-2.5 shadow-sm">
                    <div className="mb-1.5 flex items-start justify-between gap-2">
                        <div>
                            <p className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
                                <CircuitBoard className="text-foreground/65 size-3.5 shrink-0 stroke-[1.75]" aria-hidden />
                                Operations health
                            </p>
                            <p className="text-muted-foreground mt-0.5 text-[11px] leading-snug">
                                Load + recoveries − open friction, capped 0–100. Today is the last point.
                            </p>
                        </div>
                    </div>
                    <ChartContainer className="h-[190px]">
                        <AreaChart data={pulseLine} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
                            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                            <YAxis domain={[0, 100]} width={28} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                            <Tooltip
                                cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '3 3' }}
                                content={({ active, payload }) =>
                                    active && payload?.length ? (
                                        <ChartTooltipBox
                                            label={String(payload[0]?.payload?.label)}
                                            detail="Composite from occupancy, guests, issues, and resolutions."
                                            value={`${Number(payload[0]?.value).toFixed(1)} / 100`}
                                        />
                                    ) : null
                                }
                            />
                            <Area
                                type="monotone"
                                dataKey="score"
                                stroke="var(--chart-1)"
                                strokeWidth={2}
                                fill="var(--chart-1)"
                                fillOpacity={0.1}
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 0, fill: 'var(--chart-1)' }}
                            />
                        </AreaChart>
                    </ChartContainer>
                </div>

                <div className="border-border/50 bg-card/50 rounded-lg border p-2.5 shadow-sm">
                    <div className="mb-1.5">
                        <p className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
                            <Hotel className="text-foreground/65 size-3.5 shrink-0 stroke-[1.75]" aria-hidden />
                            Room occupancy
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-[11px] leading-snug">Inventory split from live room flags.</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-4">
                        {occData.length === 0 ? (
                            <div className="text-muted-foreground flex min-h-[168px] w-full max-w-[180px] items-center justify-center rounded-lg border border-dashed p-3 text-center text-[11px]">
                                No room data yet.
                            </div>
                        ) : (
                            <ChartContainer className="h-[180px] max-w-[180px]">
                                <PieChart>
                                    <Pie
                                        data={occData}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={52}
                                        outerRadius={72}
                                        strokeWidth={2}
                                        stroke="var(--background)"
                                        paddingAngle={1}
                                    >
                                        {occData.map((entry) => (
                                            <Cell key={entry.name} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        content={({ active, payload }) =>
                                            active && payload?.length ? (
                                                <ChartTooltipBox
                                                    label={String(payload[0]?.name)}
                                                    detail="Share of total room inventory."
                                                    value={`${Number(payload[0]?.value).toFixed(1)}%`}
                                                />
                                            ) : null
                                        }
                                    />
                                </PieChart>
                            </ChartContainer>
                        )}
                        <div className="text-center sm:text-left">
                            <p className="text-2xl font-semibold tabular-nums">{s.occupancyPercent.toFixed(0)}%</p>
                            <p className="text-muted-foreground text-xs">in use</p>
                            <p className="text-muted-foreground mt-1.5 max-w-56 text-[10px] leading-relaxed">
                                When this rises, stage F&B and housekeeping before guests feel the squeeze.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-2.5 lg:grid-cols-2">
                <div className="border-border/50 bg-card/50 rounded-lg border p-2.5 shadow-sm">
                    <p className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
                        <Inbox className="text-foreground/65 size-3.5 shrink-0 stroke-[1.75]" aria-hidden />
                        Queue backlog
                    </p>
                    <p className="text-muted-foreground mb-1.5 mt-0.5 text-[11px] leading-snug">
                        Pending jobs per lane (empty is healthy).
                    </p>
                    {queueRows.length === 0 ? (
                        <div className="text-muted-foreground bg-muted/20 flex min-h-[148px] items-center justify-center rounded-lg border border-dashed p-3 text-center text-xs">
                            All clear — or running in sync mode.
                        </div>
                    ) : (
                        <ChartContainer className="h-[176px]">
                            <BarChart
                                data={queueRows}
                                layout="vertical"
                                margin={{ top: 2, right: 10, left: 2, bottom: 2 }}
                            >
                                <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-border/50" />
                                <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 10 }} />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={64}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 10 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'var(--muted)', opacity: 0.35 }}
                                    content={({ active, payload }) =>
                                        active && payload?.length ? (
                                            <ChartTooltipBox
                                                label={`Queue · ${payload[0]?.payload?.name}`}
                                                detail={String(payload[0]?.payload?.key ?? '').replace(/^aria-/, '')}
                                                value={`${payload[0]?.payload?.pending} job(s) waiting`}
                                            />
                                        ) : null
                                    }
                                />
                                <Bar dataKey="pending" radius={[0, 4, 4, 0]} fill="var(--chart-3)" barSize={16} />
                            </BarChart>
                        </ChartContainer>
                    )}
                </div>

                <div className="border-border/50 bg-card/50 rounded-lg border p-2.5 shadow-sm">
                    <p className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
                        <Fingerprint className="text-foreground/65 size-3.5 shrink-0 stroke-[1.75]" aria-hidden />
                        Activity by agent
                    </p>
                    <p className="text-muted-foreground mb-1.5 mt-0.5 text-[11px] leading-snug">Steps in your current feed sample.</p>
                    {agents.length === 0 ? (
                        <div className="text-muted-foreground bg-muted/20 flex min-h-[148px] items-center justify-center rounded-lg border border-dashed p-3 text-center text-xs">
                            No steps in this sample yet.
                        </div>
                    ) : (
                        <ChartContainer className="h-[200px]">
                            <BarChart data={agents} margin={{ top: 4, right: 4, left: 0, bottom: 28 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    axisLine={false}
                                    angle={-20}
                                    textAnchor="end"
                                    height={40}
                                    tick={{ fontSize: 9 }}
                                />
                                <YAxis tickLine={false} axisLine={false} width={22} allowDecimals={false} tick={{ fontSize: 10 }} />
                                <Tooltip
                                    cursor={{ fill: 'var(--muted)', opacity: 0.3 }}
                                    content={({ active, payload }) =>
                                        active && payload?.length ? (
                                            <ChartTooltipBox
                                                label={`Agent · ${String(payload[0]?.payload?.name)}`}
                                                detail="Count of recent actions in the loaded feed."
                                                value={`${payload[0]?.payload?.count} step(s)`}
                                            />
                                        ) : null
                                    }
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {agents.map((_, i) => (
                                        <Cell key={agents[i]!.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    )}
                </div>
            </div>
        </div>
    );
}
