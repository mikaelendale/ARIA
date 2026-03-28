import { useMemo } from 'react';
import { useActionFeedStore } from '@/app/store/useActionFeedStore';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatCurrencyETB, formatRelativeTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { AgentName } from '@/types/ops';

const agentStyles: Record<AgentName, { accent: string; label: string }> = {
    nexus: { accent: 'border-l-blue-500', label: 'Nexus' },
    pulse: { accent: 'border-l-green-500', label: 'Pulse' },
    vera: { accent: 'border-l-purple-500', label: 'Vera' },
    echo: { accent: 'border-l-amber-500', label: 'Echo' },
    hermes: { accent: 'border-l-teal-500', label: 'Hermes' },
    sentinel: { accent: 'border-l-slate-500', label: 'Sentinel' },
};

export function ActionFeed() {
    const actions = useActionFeedStore((state) => state.actions);
    const count = useMemo(() => actions.length, [actions.length]);

    return (
        <Card className="bg-background border-muted rounded-xl p-0 shadow-sm">
            <div className="flex items-center justify-between p-4">
                <div className="text-sm font-semibold">Live Action Feed</div>
                <Badge variant="secondary" className="rounded-md">
                    {count} events
                </Badge>
            </div>
            <Separator />
            <ScrollArea className="h-[560px]">
                <div className="space-y-2 p-3">
                    {actions.map((item) => {
                        const style = agentStyles[item.agent];

                        return (
                            <div
                                key={item.id}
                                className={cn(
                                    'border-muted rounded-lg border border-l-4 bg-background p-3',
                                    style.accent,
                                )}
                            >
                                <div className="mb-1 flex items-center justify-between gap-2">
                                    <div className="text-xs font-medium">{style.label}</div>
                                    <div className="text-muted-foreground text-xs">
                                        {formatRelativeTime(item.timestamp)}
                                    </div>
                                </div>
                                <div className="text-foreground text-sm">{item.message}</div>
                                <div className="text-muted-foreground mt-2 flex items-center justify-between text-xs">
                                    <span>Tool: {item.tool}</span>
                                    <span>{formatCurrencyETB(item.revenueImpact)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        </Card>
    );
}
