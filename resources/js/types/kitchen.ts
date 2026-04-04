import type { QueueSnapshot } from '@/types/ops';

export type KitchenAttention = 'urgent' | 'elevated' | 'standard';

export type KitchenGuest = {
    id: string;
    name: string;
    isVip: boolean;
    churnRiskScore: number;
    preferenceTags: string[];
    languagePreference: string | null;
    nationality: string | null;
    lastInteractionAt: string | null;
    openIncidentsCount: number;
    phoneTail: string | null;
};

export type KitchenStep = {
    id: string;
    agent: string;
    tool: string;
    message: string;
    timestamp: string;
};

export type KitchenOrder = {
    id: string;
    roomNumber: string;
    items: string | null;
    placedAt: string | null;
    waitMinutes: number | null;
    pastSentinelSla: boolean;
    sentinelDelayMinutes: number;
    attention: KitchenAttention;
    assistantHeadline: string;
    assistantBullets: string[];
    guest: KitchenGuest | null;
    recentSteps: KitchenStep[];
    deliveredAt: string | null;
};

export type KitchenCompletedOrder = {
    id: string;
    roomNumber: string;
    guestName: string | null;
    items: string | null;
    placedAt: string | null;
    waitMinutes: number | null;
    deliveredAt: string | null;
};

export type KitchenSignal = {
    id: string;
    agent: string;
    tool: string;
    message: string;
    timestamp: string;
    roomHint: string | null;
};

export type KitchenPageProps = {
    pending: KitchenOrder[];
    completedToday: KitchenCompletedOrder[];
    boardBriefing: string;
    boardBullets: string[];
    signals: KitchenSignal[];
    queueSnapshot: QueueSnapshot;
    occupancyPercent: number;
    pollSeconds: number;
};
