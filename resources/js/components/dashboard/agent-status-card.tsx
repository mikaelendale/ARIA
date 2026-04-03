import { useMemo } from 'react';
import { useAgentStore } from '@/app/store/useAgentStore';
import { AgentStatusBadge } from '@/components/dashboard/agent-status-badge';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { AgentName } from '@/types/ops';
import { ChevronDown } from 'lucide-react';

const PRIMARY_AGENTS: AgentName[] = ['nexus', 'pulse', 'vera', 'echo', 'hermes', 'sentinel'];

export function AgentStatusCard() {
    const agents = useAgentStore((state) => state.agents);

    const { primary, orchestrator } = useMemo(() => {
        const primaryList = PRIMARY_AGENTS.map((name) => agents[name]).filter(Boolean);
        const orch = agents.orchestrator;

        return { primary: primaryList, orchestrator: orch };
    }, [agents]);

    return (
        <Card className="border-border/50 bg-muted/15 rounded-lg border p-3 shadow-none">
            <div className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-[0.18em]">
                Agent status
            </div>
            <div className="space-y-1.5">
                {primary.map((agent) => (
                    <div
                        key={agent.name}
                        className="border-border/50 flex items-center justify-between gap-2 rounded-md border bg-card/30 px-2 py-1"
                    >
                        <AgentStatusBadge agent={agent} className="min-w-0 flex-1" />
                        <Badge variant="secondary" className="shrink-0 rounded-md text-[10px] capitalize">
                            {agent.status}
                        </Badge>
                    </div>
                ))}
            </div>

            <Collapsible defaultOpen className="group/coll mt-3">
                <CollapsibleTrigger className="text-muted-foreground hover:text-foreground flex w-full items-center justify-between rounded-md py-1 text-xs font-medium transition-colors">
                    <span>Core</span>
                    <ChevronDown className="size-4 transition-transform group-data-[state=open]/coll:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                    <div className="border-border/50 flex items-center justify-between gap-2 rounded-md border bg-card/30 px-2 py-1">
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
