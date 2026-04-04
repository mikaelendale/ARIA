import { QueueOpsStrip } from '@/components/dashboard/queue-ops-strip';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { friendlyAgentName } from '@/lib/aria-agent-copy';
import { formatTimeAgo } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { KitchenSignal } from '@/types/kitchen';
import type { QueueSnapshot } from '@/types/ops';
import { Bot, ChevronRight, Sparkles } from 'lucide-react';
import { useState } from 'react';

const agentAccent: Record<string, string> = {
    nexus: 'border-l-blue-500',
    pulse: 'border-l-green-500',
    vera: 'border-l-purple-500',
    echo: 'border-l-amber-500',
    hermes: 'border-l-teal-500',
    sentinel: 'border-l-slate-500',
    orchestrator: 'border-l-indigo-500',
};

/** Always-visible ARIA summary for the kitchen sidebar. */
export function KitchenAriaBriefingPanel({
    boardBriefing,
    boardBullets,
    occupancyPercent,
}: {
    boardBriefing: string;
    boardBullets: string[];
    occupancyPercent: number;
}) {
    return (
        <Card className="border-border/40 from-muted/30 via-card to-card overflow-hidden rounded-lg border bg-linear-to-br py-0 shadow-none">
            <CardHeader className="border-border/40 flex flex-row items-start gap-3 border-b bg-muted/20 px-4 py-3">
                <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-md">
                    <Sparkles className="size-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-base font-semibold">ARIA briefing</CardTitle>
                        <Badge variant="secondary" className="rounded-md text-[10px] font-normal">
                            Live context
                        </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">{boardBriefing}</p>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 px-4 py-3">
                <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.18em] uppercase">
                    Grounding notes
                </p>
                <ul className="space-y-2">
                    {boardBullets.map((line) => (
                        <li
                            key={line.slice(0, 48)}
                            className="text-foreground/90 flex gap-2 text-xs leading-relaxed"
                        >
                            <ChevronRight className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                            <span>{line}</span>
                        </li>
                    ))}
                </ul>
                <Separator className="bg-border/60" />
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Occupancy signal:{' '}
                    <span className="text-foreground font-medium tabular-nums">{occupancyPercent}%</span> of rooms marked
                    in use — same number the overview dashboard uses.
                </p>
            </CardContent>
        </Card>
    );
}

export function KitchenInsightsPanel({
    boardBriefing,
    boardBullets,
    signals,
    queueSnapshot,
    occupancyPercent,
    showBriefing = true,
}: {
    boardBriefing: string;
    boardBullets: string[];
    signals: KitchenSignal[];
    queueSnapshot: QueueSnapshot | null | undefined;
    occupancyPercent: number;
    /** When false, only queue strip + signals (briefing rendered separately). */
    showBriefing?: boolean;
}) {
    const [signalsOpen, setSignalsOpen] = useState(false);

    return (
        <div className="flex flex-col gap-4">
            {showBriefing ? (
                <KitchenAriaBriefingPanel
                    boardBriefing={boardBriefing}
                    boardBullets={boardBullets}
                    occupancyPercent={occupancyPercent}
                />
            ) : null}

            <QueueOpsStrip snapshot={queueSnapshot} />

            <Card className="border-border/40 flex max-h-[min(52vh,420px)] flex-col rounded-lg border py-0 shadow-none">
                <button
                    type="button"
                    onClick={() => setSignalsOpen((o) => !o)}
                    className="border-border/40 flex w-full items-center justify-between border-b px-4 py-3 text-left transition-colors hover:bg-muted/30"
                >
                    <div className="flex items-center gap-2">
                        <Bot className="text-muted-foreground size-4" />
                        <div>
                            <p className="text-sm font-semibold">Cross-team signals</p>
                            <p className="text-muted-foreground text-[11px]">
                                Recent ARIA steps tied to these guests, kitchen pings, or room mentions.
                            </p>
                        </div>
                    </div>
                    <ChevronRight
                        className={cn(
                            'text-muted-foreground size-4 shrink-0 transition-transform',
                            signalsOpen && 'rotate-90',
                        )}
                    />
                </button>
                {signalsOpen ? (
                    <ScrollArea className="min-h-0 flex-1">
                        <ul className="divide-border/60 divide-y px-2 py-1">
                            {signals.length === 0 ? (
                                <li className="text-muted-foreground px-2 py-6 text-center text-xs">
                                    No recent signals yet — they appear as guests chat, Sentinel runs, or tools fire.
                                </li>
                            ) : (
                                signals.map((s) => (
                                    <li
                                        key={s.id}
                                        className={cn(
                                            'border-border/40 border-l-2 py-2.5 pl-3 pr-2',
                                            agentAccent[s.agent] ?? 'border-l-zinc-400',
                                        )}
                                    >
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <span className="text-foreground text-xs font-medium">
                                                {friendlyAgentName(s.agent)}
                                            </span>
                                            <span className="text-muted-foreground font-mono text-[10px]">
                                                {s.tool}
                                            </span>
                                            {s.roomHint ? (
                                                <Badge variant="outline" className="h-5 rounded px-1.5 font-mono text-[10px]">
                                                    {s.roomHint}
                                                </Badge>
                                            ) : null}
                                            <span className="text-muted-foreground ml-auto text-[10px] tabular-nums">
                                                {formatTimeAgo(s.timestamp)}
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground mt-1 text-[11px] leading-snug">{s.message}</p>
                                    </li>
                                ))
                            )}
                        </ul>
                    </ScrollArea>
                ) : null}
            </Card>
        </div>
    );
}
