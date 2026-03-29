import { create } from 'zustand';
import type { AgentMeta, AgentName } from '@/types/ops';

interface AgentStoreState {
    agents: Record<AgentName, AgentMeta>;
    updateAgentLastRun: (agent: AgentName, timestamp: string) => void;
    setAgentLastRuns: (items: { name: AgentName; lastRun: string | null }[]) => void;
    computeStatus: () => void;
}

const AGENT_NAMES: AgentName[] = ['nexus', 'pulse', 'vera', 'echo', 'hermes', 'sentinel'];

function deriveStatus(lastRun: string | null): AgentMeta['status'] {
    if (!lastRun) {
        return 'red';
    }

    const diffMinutes = (Date.now() - new Date(lastRun).getTime()) / (1000 * 60);

    if (diffMinutes < 2) {
        return 'green';
    }

    if (diffMinutes <= 10) {
        return 'yellow';
    }

    return 'red';
}

function createInitialAgents(): Record<AgentName, AgentMeta> {
    return AGENT_NAMES.reduce(
        (acc, name) => {
            acc[name] = { name, lastRun: null, status: 'red' };

            return acc;
        },
        {} as Record<AgentName, AgentMeta>,
    );
}

export const useAgentStore = create<AgentStoreState>((set) => ({
    agents: createInitialAgents(),
    updateAgentLastRun: (agent, timestamp) =>
        set((state) => ({
            agents: {
                ...state.agents,
                [agent]: {
                    ...state.agents[agent],
                    lastRun: timestamp,
                    status: deriveStatus(timestamp),
                },
            },
        })),
    setAgentLastRuns: (items) =>
        set((state) => {
            const next = { ...state.agents };
            items.forEach(({ name, lastRun }) => {
                next[name] = {
                    ...next[name],
                    lastRun,
                    status: deriveStatus(lastRun),
                };
            });

            return { agents: next };
        }),
    computeStatus: () =>
        set((state) => {
            const next = { ...state.agents };
            Object.values(next).forEach((agent) => {
                agent.status = deriveStatus(agent.lastRun);
            });

            return { agents: next };
        }),
}));
