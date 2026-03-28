export type AgentName = 'nexus' | 'pulse' | 'vera' | 'echo' | 'hermes' | 'sentinel';

export interface ActionFeedItem {
    id: string;
    agent: AgentName;
    tool: string;
    message: string;
    timestamp: string;
    revenueImpact: number;
}

export interface AgentMeta {
    name: AgentName;
    lastRun: string | null;
    status: 'green' | 'yellow' | 'red';
}

export interface PricingAdjustedEvent {
    amount: number;
    timestamp: string;
}

export interface Guest {
    id: number;
    name: string;
    room: string;
    churnScore: number;
    vip: boolean;
    lastInteraction: string;
}

export interface Incident {
    id: number;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'triaged' | 'resolved';
    resolutionTime: string | null;
    createdAt: string;
}
