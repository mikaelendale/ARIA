export type RevenueDailyPoint = {
    date: string;
    shortLabel: string;
    revenue: number;
    event: string | null;
};

export type RevenueSegment = {
    key: string;
    label: string;
    amount: number;
};

export type RevenueScenario = {
    id: string;
    title: string;
    dayLabel: string;
    impact: number;
    tag: string;
    story: string;
};

export type RevenueAiOverview = {
    headline: string;
    summary: string;
    bullets: string[];
    watchlist: string[];
    confidence: string;
};

export type RevenuePageProps = {
    currency: string;
    periodLabel: string;
    generatedAt: string;
    /** How totals are built (bookings + agent log). */
    snapshotNote: string;
    kpis: {
        totalRevenue: number;
        wowChangePct: number;
        adr: number;
        revpar: number;
        occupancyPct: number;
        pulseAttributed: number;
    };
    daily: RevenueDailyPoint[];
    segments: RevenueSegment[];
    scenarios: RevenueScenario[];
    aiOverview: RevenueAiOverview;
    staffActions: string[];
};
