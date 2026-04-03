export type AgentName =
    | 'nexus'
    | 'pulse'
    | 'vera'
    | 'echo'
    | 'hermes'
    | 'sentinel'
    | 'orchestrator';

export interface ActionFeedItem {
    id: string;
    agent: string;
    tool: string;
    message: string;
    timestamp: string;
    revenueImpact: number;
}

export interface QueueSnapshot {
    connection: string;
    pendingByQueue: Record<string, number>;
    pendingTotal: number;
    failedLast24h: number;
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
    id: string;
    name: string;
    room: string;
    churnScore: number;
    vip: boolean;
    lastInteraction: string;
}

export interface GuestDetail extends Guest {
    phone?: string;
    email?: string | null;
    preferenceTags?: string[];
    bookings: GuestBookingRow[];
    incidents: GuestIncidentRow[];
    agentActions: GuestAgentActionRow[];
}

export interface GuestBookingRow {
    id: string;
    room_number: string | null;
    room_type: string | null;
    check_in_date: string | null;
    check_out_date: string | null;
    status: string;
    total_amount: string;
}

export interface GuestIncidentRow {
    id: string;
    type: string;
    severity: string;
    status: string;
    description: string | null;
    createdAt: string | null;
}

export interface GuestAgentActionRow {
    id: string;
    agent: string;
    tool: string;
    message: string;
    status: string;
    timestamp: string | null;
    revenueImpact: number;
}

export interface Incident {
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'triaged' | 'resolved';
    resolutionTime: string | null;
    createdAt: string;
}

export interface IncidentDetail extends Incident {
    description: string | null;
    agentActions: GuestAgentActionRow[];
}
