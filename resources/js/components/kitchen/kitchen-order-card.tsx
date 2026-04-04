import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { friendlyAgentName } from '@/lib/aria-agent-copy';
import { formatTimeAgo } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { KitchenOrder } from '@/types/kitchen';
import { delivered } from '@/routes/kitchen/orders';
import { router } from '@inertiajs/react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';

const attentionStyles: Record<string, { bar: string; border: string }> = {
    urgent: { bar: 'bg-destructive', border: 'ring-destructive/50 ring-2' },
    elevated: { bar: 'bg-amber-500', border: 'ring-amber-500/50 ring-2' },
    standard: { bar: 'bg-primary/70', border: 'ring-primary/50 ring-2' },
};

const stepAccent: Record<string, string> = {
    nexus: 'border-l-blue-500',
    pulse: 'border-l-green-500',
    vera: 'border-l-purple-500',
    echo: 'border-l-amber-500',
    hermes: 'border-l-teal-500',
    sentinel: 'border-l-slate-500',
    orchestrator: 'border-l-indigo-500',
};

function formatClock(iso: string | null): string {
    if (!iso) {
        return '—';
    }
    return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function KitchenOrderCard({ order }: { order: KitchenOrder }) {
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const style = attentionStyles[order.attention] ?? attentionStyles.standard;
    const wait = order.waitMinutes ?? 0;
    const sla = Math.max(1, order.sentinelDelayMinutes);
    const progressValue = Math.min(100, Math.round((wait / sla) * 100));

    const markDone = useCallback(() => {
        setBusy(true);
        router.post(delivered.url(order.id), {}, {
            preserveScroll: true,
            onFinish: () => setBusy(false),
        });
    }, [order.id]);

    const statusLabel =
        order.pastSentinelSla ? 'Running late' : order.attention === 'elevated' ? 'Priority' : null;

    return (
        <Card
            className={cn(
                'aria-animate-in flex h-full flex-col overflow-hidden rounded-lg  bg-card/40 py-0 shadow-none transition-shadow hover:border-border hover:shadow-sm',
                style.border,
            )}
        >
            <CardContent className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <p className="text-muted-foreground font-mono text-2xl font-bold leading-none tracking-tight sm:text-3xl">
                            {order.roomNumber}
                        </p>
                        {order.guest?.name ? (
                            <p className="text-muted-foreground mt-1 truncate text-xs">{order.guest.name}</p>
                        ) : null}
                    </div>
                    <div className="shrink-0 text-right">
                        <p className="text-muted-foreground text-[10px] uppercase tracking-wide">Waiting</p>
                        <p className="text-foreground text-lg font-semibold tabular-nums">{order.waitMinutes ?? '—'}′</p>
                    </div>
                </div>

                <p className="text-foreground line-clamp-2 min-h-[2.5rem] text-sm leading-snug">
                    {order.items?.trim() || 'Room service'}
                </p>

                <div className="flex flex-wrap items-center gap-1.5">
                    {order.guest?.isVip ? (
                        <Badge variant="secondary" className="h-5 rounded px-1.5 text-[10px] font-medium">
                            VIP
                        </Badge>
                    ) : null}
                    {statusLabel ? (
                        <Badge
                            variant={order.pastSentinelSla ? 'destructive' : 'outline'}
                            className="h-5 rounded px-1.5 text-[10px] font-medium"
                        >
                            {statusLabel}
                        </Badge>
                    ) : null}
                </div>

                <div className="space-y-1">
                    <div className="text-muted-foreground flex justify-between text-[9px] font-medium uppercase tracking-wider">
                        <span>Time guide ({sla} min)</span>
                        <span className="tabular-nums">
                            {wait}/{sla}
                        </span>
                    </div>
                    <Progress value={progressValue} indicatorClassName={style.bar} className="h-1" />
                </div>

                <p className="text-muted-foreground text-[11px] tabular-nums">Ordered {formatClock(order.placedAt)}</p>

                <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
                    <CollapsibleTrigger className="text-muted-foreground hover:text-foreground flex w-full items-center justify-between rounded-md py-1.5 text-left text-xs font-medium transition-colors">
                        <span>Notes &amp; guest info</span>
                        <ChevronDown className={cn('size-4 shrink-0 transition-transform', detailsOpen && 'rotate-180')} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-3 pt-1">
                        <div className="bg-muted/30 rounded-md border border-border/40 px-3 py-2">
                            <p className="text-foreground text-xs leading-snug">{order.assistantHeadline}</p>
                        </div>
                        <ul className="text-muted-foreground space-y-1.5 text-[11px] leading-relaxed">
                            {order.assistantBullets.map((b) => (
                                <li key={b.slice(0, 36)} className="flex gap-2">
                                    <span className="bg-primary/50 mt-1.5 size-1 shrink-0 rounded-full" />
                                    <span>{b}</span>
                                </li>
                            ))}
                        </ul>
                        {order.guest ? (
                            <div className="border-border/50 rounded-md border bg-background/50 p-2.5 text-[11px]">
                                <dl className="grid gap-1.5 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-muted-foreground">Guest score</dt>
                                        <dd className="font-medium tabular-nums">{order.guest.churnRiskScore}/100</dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground">Open issues</dt>
                                        <dd className="font-medium tabular-nums">{order.guest.openIncidentsCount}</dd>
                                    </div>
                                    {order.guest.preferenceTags.length > 0 ? (
                                        <div className="sm:col-span-2 flex flex-wrap gap-1 pt-1">
                                            {order.guest.preferenceTags.map((tag) => (
                                                <Badge key={tag} variant="outline" className="h-5 rounded px-1.5 text-[10px] font-normal">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : null}
                                </dl>
                            </div>
                        ) : null}
                        <div>
                            <p className="text-muted-foreground mb-1.5 text-[9px] font-semibold uppercase tracking-wider">
                                Recent system steps
                            </p>
                            <ul className="max-h-36 space-y-1.5 overflow-y-auto">
                                {order.recentSteps.length === 0 ? (
                                    <li className="text-muted-foreground text-[11px]">None since this order.</li>
                                ) : (
                                    order.recentSteps.map((s) => (
                                        <li
                                            key={s.id}
                                            className={cn(
                                                'rounded border-l-2 bg-muted/20 py-1.5 pl-2 pr-1.5',
                                                stepAccent[s.agent] ?? 'border-l-zinc-400',
                                            )}
                                        >
                                            <div className="flex flex-wrap items-center gap-1 text-[9px]">
                                                <span className="font-medium">{friendlyAgentName(s.agent)}</span>
                                                <span className="text-muted-foreground ml-auto tabular-nums">
                                                    {formatTimeAgo(s.timestamp)}
                                                </span>
                                            </div>
                                            <p className="text-muted-foreground mt-0.5 text-[10px] leading-snug">{s.message}</p>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </CardContent>

            <CardFooter className=" p-3 pt-3">
                <Button type="button" size="sm" className="w-full rounded-md" disabled={busy} onClick={markDone}>
                    {busy ? (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            Saving…
                        </>
                    ) : (
                        'Done — sent to room'
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
