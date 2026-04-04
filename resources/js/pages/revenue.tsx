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
    return `${n.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${currency}`;
}

export default function RevenuePage() {
    const props = usePage<RevenuePageProps>().props;
    const {
        currency,
        periodLabel,
        generatedAt,
        kpis,
        daily,
        segments,
        scenarios,
        aiOverview,
        staffActions,
    } = props;

    const positive = kpis.wowChangePct >= 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Revenue — Kuriftu" />
            <div className="space-y-8 py-6">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                            Finance & ops
                        </p>
                        <Badge variant="secondary" className="text-[10px] font-normal">
                            Demo data
                        </Badge>
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight">Revenue intelligence</h1>
                    <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
                        Seeded scenarios and charts so front office and managers can rehearse how ARIA explains money:
                        spikes, mix, and what PULSE may have influenced — without touching live ledgers.
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                        {periodLabel} · snapshot {new Date(generatedAt).toLocaleString()}
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-border/50 shadow-none">
                        <CardHeader className="pb-2">
                            <CardDescription>Total revenue</CardDescription>
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
                                {kpis.wowChangePct}% vs prior window
                            </span>
                        </CardContent>
                    </Card>
                    <Card className="border-border/50 shadow-none">
                        <CardHeader className="pb-2">
                            <CardDescription>ADR</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums">
                                {formatMoney(kpis.adr, currency)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground text-xs">Average daily rate (demo)</CardContent>
                    </Card>
                    <Card className="border-border/50 shadow-none">
                        <CardHeader className="pb-2">
                            <CardDescription>RevPAR</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums">
                                {formatMoney(kpis.revpar, currency)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground text-xs">Revenue per available room</CardContent>
                    </Card>
                    <Card className="border-border/50 shadow-none">
                        <CardHeader className="pb-2">
                            <CardDescription>PULSE-attributed</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums">
                                {formatMoney(kpis.pulseAttributed, currency)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground text-xs">
                            Pricing & promo lift (illustrative)
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-5">
                    <Card className="border-border/50 lg:col-span-3">
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

                    <Card className="border-border/50 bg-muted/20 lg:col-span-2">
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
                                Confidence: {aiOverview.confidence} — use as training narrative only.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle className="text-base">Real-life style scenarios</CardTitle>
                            <CardDescription>Why the line moved — stories staff can retell to guests or leadership</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {scenarios.map((s) => (
                                <div
                                    key={s.id}
                                    className="border-border/60 rounded-lg border bg-card/50 px-4 py-3 transition-colors hover:bg-muted/30"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-foreground font-medium">{s.title}</p>
                                        <Badge variant="secondary">{s.tag}</Badge>
                                    </div>
                                    <p className="text-muted-foreground mt-1 text-xs">{s.dayLabel}</p>
                                    <p className="text-chart-1 mt-2 text-sm font-semibold tabular-nums">
                                        +{formatMoney(s.impact, currency)} estimated lift
                                    </p>
                                    <p className="text-muted-foreground mt-2 text-[13px] leading-relaxed">{s.story}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle className="text-base">Revenue mix</CardTitle>
                            <CardDescription>Where the property earned over the window (demo split)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RevenueMixChart segments={segments} currency={currency} />
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-border/50 border-dashed">
                    <CardHeader>
                        <CardTitle className="text-base">Suggested staff actions</CardTitle>
                        <CardDescription>Concrete next steps derived from the same demo patterns</CardDescription>
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
