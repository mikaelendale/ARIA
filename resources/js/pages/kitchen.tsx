import { Head, Link, router, usePage } from '@inertiajs/react';
import { KitchenAriaBriefingPanel, KitchenInsightsPanel } from '@/components/kitchen/kitchen-insights-panel';
import { KitchenOrderCard } from '@/components/kitchen/kitchen-order-card';
import AppLogo from '@/components/app-logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { UtensilsCrossed } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { KitchenPageProps } from '@/types/kitchen';
import AppLogoIcon from '@/components/app-logo-icon';

type FilterId = 'all' | 'focus' | 'urgent';

function formatClock(iso: string | null): string {
    if (!iso) {
        return '—';
    }
    return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function Kitchen() {
    const {
        pending,
        completedToday,
        boardBriefing,
        boardBullets,
        signals,
        queueSnapshot,
        occupancyPercent,
        pollSeconds,
    } = usePage<KitchenPageProps>().props;

    const [filter, setFilter] = useState<FilterId>('all');

    useEffect(() => {
        const ms = Math.max(pollSeconds, 5) * 1000;
        const id = window.setInterval(() => {
            router.reload({
                only: [
                    'pending',
                    'completedToday',
                    'boardBriefing',
                    'boardBullets',
                    'signals',
                    'queueSnapshot',
                    'occupancyPercent',
                    'pollSeconds',
                ],
            });
        }, ms);
        return () => window.clearInterval(id);
    }, [pollSeconds]);

    const filtered = useMemo(() => {
        if (filter === 'urgent') {
            return pending.filter((o) => o.attention === 'urgent');
        }
        if (filter === 'focus') {
            return pending.filter((o) => o.attention !== 'standard');
        }
        return pending;
    }, [pending, filter]);

    const urgentCount = pending.filter((o) => o.attention === 'urgent').length;
    const focusCount = pending.filter((o) => o.attention !== 'standard').length;

    const sidebar = (
        <div className="flex flex-col gap-4 lg:sticky lg:top-18 lg:self-start">
            <KitchenAriaBriefingPanel
                boardBriefing={boardBriefing}
                boardBullets={boardBullets}
                occupancyPercent={occupancyPercent}
            />
            <KitchenInsightsPanel
                showBriefing={false}
                boardBriefing={boardBriefing}
                boardBullets={boardBullets}
                signals={signals}
                queueSnapshot={queueSnapshot}
                occupancyPercent={occupancyPercent}
            />
        </div>
    );

    return (
        <>
            <Head title="Room service" />
            <div className="flex min-h-screen w-full flex-col bg-background">
                <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
                    <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
                        <Link href="/" prefetch className="flex  justify-center rounded-md  text-sidebar-primary-foreground shrink-0 items-center gap-2 ">
                            <AppLogoIcon />
                        </Link>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-foreground truncate text-lg font-semibold tracking-tight">Room service</h1>
                            <p className="text-muted-foreground truncate text-xs">Kitchen — guest orders</p>
                        </div>
                        <Badge variant="outline" className="shrink-0 rounded-md tabular-nums">
                            {pending.length} open
                        </Badge>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 sm:px-6">
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start">
                        <div className="min-w-0 space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                {(
                                    [
                                        ['all', 'All', pending.length],
                                        ['focus', 'Priority', focusCount],
                                        ['urgent', 'Late / urgent', urgentCount],
                                    ] as const
                                ).map(([id, label, count]) => (
                                    <Button
                                        key={id}
                                        type="button"
                                        size="sm"
                                        variant={filter === id ? 'default' : 'outline'}
                                        className="h-8 rounded-md px-3 text-xs"
                                        onClick={() => setFilter(id)}
                                    >
                                        {label}
                                        <span
                                            className={cn(
                                                'ml-1.5 rounded bg-background/20 px-1.5 py-0.5 text-[10px] tabular-nums',
                                                filter !== id && 'bg-muted text-muted-foreground',
                                            )}
                                        >
                                            {count}
                                        </span>
                                    </Button>
                                ))}
                                <span className="text-muted-foreground ml-auto hidden text-[11px] lg:inline">
                                    Refreshes every {Math.max(pollSeconds, 5)}s
                                </span>
                            </div>

                            {/* Mobile / tablet: briefing after filters so it is visible without scrolling past all orders */}
                            <div className="lg:hidden">{sidebar}</div>

                            {filtered.length === 0 ? (
                                <Card className="border-border/40 bg-muted/10 rounded-lg border shadow-none">
                                    <CardContent className="flex flex-col items-center px-6 py-16 text-center">
                                        <UtensilsCrossed className="text-muted-foreground mb-3 size-9 opacity-70" />
                                        <p className="text-foreground font-medium">
                                            {pending.length === 0 ? 'No orders right now' : 'Nothing in this filter'}
                                        </p>
                                        <p className="text-muted-foreground mt-1 max-w-xs text-sm">
                                            {pending.length === 0
                                                ? 'New requests will show up here as cards.'
                                                : 'Try “All” to see every open ticket.'}
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-2">
                                    {filtered.map((order) => (
                                        <li key={order.id} className="min-h-0">
                                            <KitchenOrderCard order={order} />
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {completedToday.length > 0 ? (
                                <section className="mt-6">
                                    <p className="text-muted-foreground mb-2 text-xs font-medium">Sent today</p>
                                    <div className="border-border/40 divide-border/50 divide-y overflow-hidden rounded-lg border">
                                        {completedToday.map((order) => (
                                            <div
                                                key={order.id}
                                                className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 bg-muted/5 px-3 py-2.5 text-sm"
                                            >
                                                <span className="text-foreground font-mono font-semibold">
                                                    {order.roomNumber}
                                                </span>
                                                <span className="max-w-[50%] flex-1 truncate text-xs">
                                                    {order.items?.trim() || 'Room service'}
                                                </span>
                                                <span className="text-xs tabular-nums">{formatClock(order.deliveredAt)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            ) : null}
                        </div>

                        <aside className="hidden min-w-0 lg:block">{sidebar}</aside>
                    </div>
                </main>
            </div>
        </>
    );
}
