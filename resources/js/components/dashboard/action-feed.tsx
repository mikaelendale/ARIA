import { useCallback, useEffect, useMemo, useState } from 'react';
import { useActionFeedStore } from '@/app/store/useActionFeedStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatCurrencyETB, formatRelativeTime } from '@/lib/formatters';
import { friendlyAgentFilterShort, friendlyAgentName } from '@/lib/aria-agent-copy';
import { cn } from '@/lib/utils';
import type { ActionFeedItem } from '@/types/ops';
import { Copy } from 'lucide-react';

const agentStyles: Record<string, { accent: string }> = {
    nexus: { accent: 'border-l-blue-500' },
    pulse: { accent: 'border-l-green-500' },
    vera: { accent: 'border-l-purple-500' },
    echo: { accent: 'border-l-amber-500' },
    hermes: { accent: 'border-l-teal-500' },
    sentinel: { accent: 'border-l-slate-500' },
    orchestrator: { accent: 'border-l-indigo-500' },
};

const FILTER_AGENTS = [
    { id: 'all' as const },
    { id: 'nexus' },
    { id: 'pulse' },
    { id: 'vera' },
    { id: 'echo' },
    { id: 'hermes' },
    { id: 'sentinel' },
    { id: 'orchestrator' },
] as const;

function styleForAgent(agent: string): { accent: string; label: string } {
    const base = agentStyles[agent] ?? { accent: 'border-l-zinc-500' };

    return { accent: base.accent, label: friendlyAgentName(agent) };
}

export interface ActionFeedProps {
    /** Hydrates the store when provided (e.g. from Inertia). */
    initialActions?: ActionFeedItem[];
}

export function ActionFeed({ initialActions }: ActionFeedProps) {
    const actions = useActionFeedStore((state) => state.actions);
    const setInitialActions = useActionFeedStore((state) => state.setInitialActions);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        if (initialActions === undefined) {
            return;
        }

        setInitialActions(initialActions);
    }, [initialActions, setInitialActions]);

    const filtered = useMemo(() => {
        if (filter === 'all') {
            return actions;
        }

        return actions.filter((a) => a.agent === filter);
    }, [actions, filter]);

    const copyId = useCallback(async (id: string) => {
        try {
            await navigator.clipboard.writeText(id);
        } catch {
            /* ignore */
        }
    }, []);

    return (
        <Card className="border-border/40 bg-muted/10 rounded-md border p-0 shadow-none">
            <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.18em]">
                        Live activity
                    </div>
                    <div className="text-sm font-semibold">What ARIA did</div>
                    <p className="text-muted-foreground mt-0.5 max-w-md text-[11px] leading-snug">
                        New lines appear when the system sends a message, updates pricing, or logs a step. Scroll for
                        history.
                    </p>
                </div>
                <Badge variant="secondary" className="w-fit rounded-md tabular-nums">
                    {filtered.length} {filtered.length === 1 ? 'step' : 'steps'}
                </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-1 px-3 pb-2">
                <span className="text-muted-foreground mr-1 hidden text-[10px] sm:inline">Show:</span>
                {FILTER_AGENTS.map((chip) => (
                    <Button
                        key={chip.id}
                        type="button"
                        variant={filter === chip.id ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 rounded-md px-2.5 text-xs"
                        title={
                            chip.id === 'all'
                                ? 'Show every step'
                                : `${friendlyAgentName(chip.id)} (technical name: ${chip.id})`
                        }
                        onClick={() => setFilter(chip.id)}
                    >
                        {friendlyAgentFilterShort(chip.id)}
                    </Button>
                ))}
            </div>
            <Separator />
            <ScrollArea className="h-[560px]">
                <div className="space-y-1.5 p-2">
                    {filtered.map((item, i) => {
                        const style = styleForAgent(item.agent);

                        return (
                            <div
                                key={item.id}
                                className={cn(
                                    'aria-feed-row border-border/50 group rounded-md border border-l-[3px] bg-card/40 p-2.5',
                                    style.accent,
                                )}
                                style={{ animationDelay: `${Math.min(i, 14) * 40}ms` }}
                            >
                                <div className="mb-1 flex items-center justify-between gap-2">
                                    <div className="text-xs font-medium">{style.label}</div>
                                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                                        <span>{formatRelativeTime(item.timestamp)}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
                                            title="Copy reference ID"
                                            onClick={() => copyId(item.id)}
                                        >
                                            <Copy className="size-3.5" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="text-foreground text-sm">{item.message}</div>
                                <div className="text-muted-foreground mt-2 flex items-center justify-between text-xs">
                                    <span>
                                        Action: <span className="text-foreground/90 font-mono text-[10px]">{item.tool}</span>
                                    </span>
                                    <span className="tabular-nums">{formatCurrencyETB(item.revenueImpact)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        </Card>
    );
}
