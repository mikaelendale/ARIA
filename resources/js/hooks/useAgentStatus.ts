import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAgentStore } from '@/app/store/useAgentStore';
import type { AgentName } from '@/types/ops';

interface AgentStatusResponse {
    agents: { name: AgentName; lastRun: string | null }[];
}

async function fetchAgentStatus(): Promise<AgentStatusResponse> {
    const response = await fetch('/api/ops/agents/status', {
        headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
        return { agents: [] };
    }

    return response.json() as Promise<AgentStatusResponse>;
}

export function useAgentStatus() {
    const setAgentLastRuns = useAgentStore((state) => state.setAgentLastRuns);

    const query = useQuery({
        queryKey: ['agents', 'status'],
        queryFn: fetchAgentStatus,
        refetchInterval: 15_000,
    });

    useEffect(() => {
        if (query.data?.agents?.length) {
            setAgentLastRuns(query.data.agents);
        }
    }, [query.data, setAgentLastRuns]);

    return query;
}
