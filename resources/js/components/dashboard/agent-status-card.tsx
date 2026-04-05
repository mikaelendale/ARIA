import { ChevronDown } from 'lucide-react';
import { useMemo } from 'react';
import { useAgentStore } from '@/app/store/useAgentStore';
import { AgentStatusBadge } from '@/components/dashboard/agent-status-badge';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { AgentName } from '@/types/ops';

const PRIMARY_AGENTS: AgentName[] = ['nexus', 'pulse', 'vera', 'echo', 'hermes', 'sentinel'];

export function AgentStatusCard() {
    const agents = useAgentStore((state) => state.agents);

    const { primary, orchestrator } = useMemo(() => {
        const primaryList = PRIMARY_AGENTS.map((name) => agents[name]).filter(Boolean);
        const orch = agents.orchestrator;

        return { primary: primaryList, orchestrator: orch };
    }, [agents]);

    return (
        <Card className="border-border bg-muted/20 rounded-sm border p-3 shadow-none">
            <div className="text-muted-foreground mb-0.5 text-xs font-semibold uppercase tracking-[0.18em]">
                AI helpers
            </div>
            <p className="text-muted-foreground mb-2 text-[11px] leading-snug">
                Dot color shows recency — pointer on the name shows the exact time.
            </p>
            <div className="space-y-1.5">
                {primary.map((agent) => (
                    <div
                        key={agent.name}
                        className="border-border flex items-center justify-between gap-2 rounded-sm border bg-card px-2 py-1"
                    >
                        <AgentStatusBadge agent={agent} className="min-w-0 flex-1" />
                        <Badge variant="secondary" className="shrink-0 rounded-md text-[10px] capitalize">
                            {agent.status}
                        </Badge>
                    </div>
                ))}
            </div>

            <Collapsible defaultOpen className="group/coll mt-3">
                <CollapsibleTrigger className="text-muted-foreground flex w-full items-center justify-between rounded-sm py-1 text-xs font-medium">
                    <span>Head assistant (coordinates the others)</span>
                    <ChevronDown className="size-4 group-data-[state=open]/coll:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                    <div className="border-border flex items-center justify-between gap-2 rounded-sm border bg-card px-2 py-1">
                        <AgentStatusBadge agent={orchestrator} className="min-w-0 flex-1" />
                        <Badge variant="outline" className="shrink-0 rounded-md text-[10px] capitalize">
                            {orchestrator.status}
                        </Badge>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
