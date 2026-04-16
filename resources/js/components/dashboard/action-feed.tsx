import { useEffect, useMemo, useState } from 'react';
import { useActionFeedStore } from '@/app/store/useActionFeedStore';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { friendlyAgentFilterShort, friendlyAgentName } from '@/lib/aria-agent-copy';
import { formatCurrencyETB, formatRelativeTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { ActionFeedItem } from '@/types/ops';

const AGENT_DOT: Record<string, string> = {
    nexus: 'bg-blue-500',
    pulse: 'bg-green-500',
    vera: 'bg-purple-500',
    echo: 'bg-amber-500',
    hermes: 'bg-teal-500',
    sentinel: 'bg-slate-500',
    orchestrator: 'bg-indigo-500',
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

function filterOptionLabel(id: string): string {
    if (id === 'all') {
        return 'All helpers';
    }

    return friendlyAgentFilterShort(id);
}

function formatToolLabel(tool: string): string {
    if (!tool) {
        return '';
    }

    const readable = tool.replace(/_/g, ' ').replace(/\./g, ' · ');

    return readable.length > 40 ? `${readable.slice(0, 38)}…` : readable;
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

    return (
        <Card className="border-border bg-card overflow-hidden rounded-sm border p-0 shadow-none">
            <div className="flex flex-col gap-2 border-b border-border px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h3 className="text-foreground text-sm font-semibold leading-tight">What ARIA did</h3>
                    <p className="text-muted-foreground text-[11px] leading-snug">
                        {filtered.length} {filtered.length === 1 ? 'step' : 'steps'} · newest first
                    </p>
                </div>
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger
                        size="sm"
                        className="border-border h-8 w-full rounded-sm shadow-none sm:w-[min(100%,11rem)]"
                        aria-label="Filter by helper"
                    >
                        <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                        {FILTER_AGENTS.map((chip) => (
                            <SelectItem
                                key={chip.id}
                                value={chip.id}
                                title={
                                    chip.id === 'all'
                                        ? undefined
                                        : `${friendlyAgentName(chip.id)} — technical name: ${chip.id}`
                                }
                            >
                                {filterOptionLabel(chip.id)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <ScrollArea className="h-[min(380px,48vh)] xl:h-[min(440px,52vh)]">
                <div className="divide-border divide-y px-2">
                    {filtered.length === 0 ? (
                        <p className="text-muted-foreground px-2 py-6 text-center text-sm">
                            No steps yet. Run a practice scenario or work the app to see activity here.
                        </p>
                    ) : (
                        filtered.map((item) => {
                            const label = friendlyAgentName(item.agent);
                            const dot = AGENT_DOT[item.agent] ?? 'bg-muted-foreground';
                            const toolShown = formatToolLabel(item.tool);
                            const hasRevenue = item.revenueImpact !== 0;

                            return (
                                <div
                                    key={item.id}
                                    className="flex gap-2.5 py-2.5 pl-1 pr-1"
                                    title={`Step ${item.id.slice(0, 8)}…`}
                                >
                                    <div
                                        className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', dot)}
                                        aria-hidden
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-muted-foreground flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[11px] leading-snug">
                                            <span className="text-foreground font-medium">{label}</span>
                                            <span className="tabular-nums">{formatRelativeTime(item.timestamp)}</span>
                                            {toolShown ? (
                                                <span className="text-muted-foreground/90 font-mono text-[10px] tracking-tight">
                                                    {toolShown}
                                                </span>
                                            ) : null}
                                        </p>
                                        <p className="text-foreground mt-1 text-sm leading-snug">{item.message}</p>
                                        {hasRevenue ? (
                                            <p className="text-muted-foreground mt-1 text-xs tabular-nums">
                                                Linked revenue: {formatCurrencyETB(item.revenueImpact)}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>
        </Card>
    );
}
