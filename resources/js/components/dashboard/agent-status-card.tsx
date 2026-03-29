import { useMemo } from 'react';
import { useAgentStore } from '@/app/store/useAgentStore';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { AgentMeta } from '@/types/ops';

const statusStyles: Record<AgentMeta['status'], string> = {
    green: 'bg-green-500',
    yellow: 'bg-amber-500',
    red: 'bg-red-500',
};

export function AgentStatusCard() {
    const agents = useAgentStore((state) => state.agents);

    const list = useMemo(
        () =>
            Object.values(agents).sort((a, b) =>
                a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
            ),
        [agents],
    );

    return (
        <Card className="bg-background border-muted rounded-xl p-4 shadow-sm">
            <div className="mb-3 text-sm font-semibold">Agent Status</div>
            <div className="space-y-2">
                {list.map((agent) => (
                    <div key={agent.name} className="flex items-center justify-between rounded-md border p-2">
                        <div className="flex items-center gap-2">
                            <span className={`size-2 rounded-full ${statusStyles[agent.status]}`} />
                            <span className="text-sm capitalize">{agent.name}</span>
                        </div>
                        <Badge variant="secondary" className="rounded-md capitalize">
                            {agent.status}
                        </Badge>
                    </div>
                ))}
            </div>
        </Card>
    );
}
