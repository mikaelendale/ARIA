import { Head, usePage } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpRight, Sparkles, TrendingUp } from 'lucide-react';

import { RevenueMixChart, RevenueTrendChart } from '@/components/revenue/revenue-charts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { dashboard, revenue } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type { RevenuePageProps } from '@/types/revenue';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Overview', href: dashboard() },
    { title: 'Revenue', href: revenue() },
];

function formatMoney(n: number, currency: string): string {
    const safe = Number.isFinite(n) ? n : 0;

    return `${safe.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${currency}`;
}

export default function RevenuePage() {
    const props = usePage<RevenuePageProps>().props;
    const {
        currency,
        periodLabel,
        generatedAt,
        snapshotNote,
        kpis,
        daily,
        segments,
        scenarios,
        aiOverview,
        staffActions,
    } = props;

    const wowSafe = Number.isFinite(kpis.wowChangePct) ? kpis.wowChangePct : 0;
    const positive = wowSafe >= 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Revenue — Kuriftu" />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6 px-4 py-4 md:px-6 md:py-5">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                            Finance & ops
                        </p>
                        <Badge variant="secondary" className="text-[10px] font-normal">
                            Live data
                        </Badge>
                    </div>
                    <h1 className="text-foreground text-2xl font-semibold tracking-tight">Revenue intelligence</h1>
                    <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
                        Same sources as the overview: room bookings by check-in date and revenue impact logged on AI agent
                        actions. Use it to narrate the operational story alongside guests and issues — not as audited
                        financials.
                    </p>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                        {periodLabel} · snapshot {new Date(generatedAt).toLocaleString()}
                    </p>
                    <p className="text-muted-foreground max-w-2xl text-[11px] leading-relaxed">{snapshotNote}</p>
                </div>

                <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-border rounded-sm shadow-none">
                        <CardHeader className="pb-2">
                            <CardDescription>Combined total</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums">
                                {formatMoney(kpis.totalRevenue, currency)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground flex items-center gap-1.5 text-xs">
                            {positive ? (
                                <ArrowUpRight className="text-chart-2 size-4" />
                            ) : (
                                <ArrowDownRight className="text-destructive size-4" />
                            )}
                            <span>
                                {positive ? '+' : ''}
                                {wowSafe}% vs prior window
                            </span>
                        </CardContent>
                    </Card>
                    <Card className="border-border rounded-sm shadow-none">
                        <CardHeader className="pb-2">
                            <CardDescription>ADR</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums">
                                {formatMoney(kpis.adr, currency)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground text-xs">
                            Average booking value on check-in (window)
                        </CardContent>
                    </Card>
                    <Card className="border-border rounded-sm shadow-none">
                        <CardHeader className="pb-2">
                            <CardDescription>RevPAR</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums">
                                {formatMoney(kpis.revpar, currency)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground text-xs">
                            Booking revenue ÷ rooms ÷ days (window)
                        </CardContent>
                    </Card>
                    <Card className="border-border rounded-sm shadow-none">
                        <CardHeader className="pb-2">
                            <CardDescription>PULSE-attributed</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums">
                                {formatMoney(kpis.pulseAttributed, currency)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground text-xs">
                            Logged PULSE / pricing / promo tool impact
                        </CardContent>
                    </Card>
                </div>

                <div className="grid min-w-0 gap-6 lg:grid-cols-5">
                    <Card className="border-border rounded-sm shadow-none lg:col-span-3">
                        <CardHeader>
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <TrendingUp className="text-chart-1 size-4" />
                                        Daily revenue trend
                                    </CardTitle>
                                    <CardDescription>
                                        Hover points to see annotated events (groups, holidays, ops).
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className="shrink-0 tabular-nums">
                                    Occ {kpis.occupancyPct}%
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <RevenueTrendChart data={daily} currency={currency} />
                        </CardContent>
                    </Card>

                    <Card className="border-border rounded-sm bg-muted/20 shadow-none lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Sparkles className="text-chart-4 size-4" />
                                AI overview
                            </CardTitle>
                            <CardDescription>Plain-language read for shift handover</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <p className="text-foreground font-medium leading-snug">{aiOverview.headline}</p>
                            <p className="text-muted-foreground leading-relaxed">{aiOverview.summary}</p>
                            <Separator />
                            <ul className="text-muted-foreground list-inside list-disc space-y-2 text-[13px] leading-relaxed">
                                {aiOverview.bullets.map((b, i) => (
                                    <li key={`b-${i}`}>{b}</li>
                                ))}
                            </ul>
                            <div>
                                <p className="text-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                                    Watchlist
                                </p>
                                <ul className="text-muted-foreground space-y-1.5 text-[13px] leading-relaxed">
                                    {aiOverview.watchlist.map((w, i) => (
                                        <li key={`w-${i}`} className="flex gap-2">
                                            <span className="text-chart-3 mt-1.5 size-1 shrink-0 rounded-full bg-current" />
                                            <span>{w}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <p className="text-muted-foreground text-[11px]">
                                Source: {aiOverview.confidence} — template summary from live aggregates.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid min-w-0 gap-6 lg:grid-cols-2">
                    <Card className="border-border rounded-sm shadow-none">
                        <CardHeader>
                            <CardTitle className="text-base">Strongest days</CardTitle>
                            <CardDescription>Highest combined booking + AI impact vs the period average</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {scenarios.length === 0 ? (
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    No standout days in this window yet — once bookings or agent actions land on the calendar,
                                    peaks will show here.
                                </p>
                            ) : null}
                            {scenarios.map((s) => (
                                <div
                                    key={s.id}
                                    className="border-border bg-card/50 hover:bg-muted/30 rounded-sm border px-4 py-3 transition-colors"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-foreground font-medium">{s.title}</p>
                                        <Badge variant="secondary">{s.tag}</Badge>
                                    </div>
                                    <p className="text-muted-foreground mt-1 text-xs">{s.dayLabel}</p>
                                    <p className="text-chart-1 mt-2 text-sm font-semibold tabular-nums">
                                        +{formatMoney(s.impact, currency)} vs average day
                                    </p>
                                    <p className="text-muted-foreground mt-2 text-[13px] leading-relaxed">{s.story}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-border rounded-sm shadow-none">
                        <CardHeader>
                            <CardTitle className="text-base">Revenue mix</CardTitle>
                            <CardDescription>Bookings vs AI-logged buckets (same window)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RevenueMixChart segments={segments} currency={currency} />
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-border rounded-sm border-dashed shadow-none">
                    <CardHeader>
                        <CardTitle className="text-base">Suggested staff actions</CardTitle>
                        <CardDescription>Grounded in current window trends</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="text-foreground space-y-3 text-sm leading-relaxed">
                            {staffActions.map((a, i) => (
                                <li key={`a-${i}`} className="flex gap-3">
                                    <span className="bg-primary/80 mt-2 size-1.5 shrink-0 rounded-full" />
                                    <span>{a}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
