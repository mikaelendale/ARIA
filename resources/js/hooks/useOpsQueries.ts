import type { PageProps } from '@inertiajs/core';
import { useQuery } from '@tanstack/react-query';
import type { ActionFeedItem, Guest, Incident, QueueSnapshot } from '@/types/ops';

export interface DashboardStats extends PageProps {
    guests: number;
    incidentsOpen: number;
    resolvedToday: number;
    churnScore: number;
    initialRevenueImpact: number;
    initialActions: ActionFeedItem[];
    occupancyPercent: number;
    revenueImpactToday: number;
    pulseRevenueToday: number;
    queueSnapshot: QueueSnapshot;
    incidentBanner?: string | null;
}

export type DashboardPageProps = DashboardStats;

async function getJsonOrFallback<T>(url: string, fallback: T): Promise<T> {
    const response = await fetch(url, { headers: { Accept: 'application/json' } });

    if (!response.ok) {
        return fallback;
    }

    return response.json() as Promise<T>;
}

function emptyStats(): DashboardStats {
    return {
        guests: 0,
        incidentsOpen: 0,
        resolvedToday: 0,
        churnScore: 0,
        initialRevenueImpact: 0,
        initialActions: [],
        occupancyPercent: 0,
        revenueImpactToday: 0,
        pulseRevenueToday: 0,
        incidentBanner: null,
        queueSnapshot: {
            connection: 'sync',
            pendingByQueue: {},
            pendingTotal: 0,
            failedLast24h: 0,
        },
    };
}

function asFiniteNumber(value: unknown, fallback = 0): number {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : fallback;
    }

    if (typeof value === 'string' && value.trim() !== '') {
        const n = Number(value);

        return Number.isFinite(n) ? n : fallback;
    }

    return fallback;
}

function normalizeQueueSnapshot(raw: unknown): DashboardStats['queueSnapshot'] {
    const empty = emptyStats().queueSnapshot;
    if (!raw || typeof raw !== 'object') {
        return empty;
    }

    const o = raw as Record<string, unknown>;
    const pendingRaw = o.pendingByQueue;
    const pendingByQueue: Record<string, number> =
        pendingRaw && typeof pendingRaw === 'object' && !Array.isArray(pendingRaw)
            ? Object.fromEntries(
                  Object.entries(pendingRaw as Record<string, unknown>).map(([k, v]) => [
                      k,
                      asFiniteNumber(v, 0),
                  ]),
              )
            : {};

    return {
        connection: typeof o.connection === 'string' ? o.connection : empty.connection,
        pendingByQueue,
        pendingTotal: asFiniteNumber(o.pendingTotal, 0),
        failedLast24h: asFiniteNumber(o.failedLast24h, 0),
    };
}

/** Coerce API / Inertia props so charts never see NaN from loose JSON types. */
export function normalizeDashboardStats(raw: Partial<DashboardPageProps> | null | undefined): DashboardStats {
    const e = emptyStats();

    const bannerRaw = raw?.incidentBanner;
    const incidentBanner =
        typeof bannerRaw === 'string' && bannerRaw.trim() !== '' ? bannerRaw.trim() : null;

    return {
        guests: asFiniteNumber(raw?.guests, 0),
        incidentsOpen: asFiniteNumber(raw?.incidentsOpen, 0),
        resolvedToday: asFiniteNumber(raw?.resolvedToday, 0),
        churnScore: asFiniteNumber(raw?.churnScore, 0),
        initialRevenueImpact: asFiniteNumber(raw?.initialRevenueImpact, 0),
        initialActions: Array.isArray(raw?.initialActions) ? raw!.initialActions! : e.initialActions,
        occupancyPercent: asFiniteNumber(raw?.occupancyPercent, 0),
        revenueImpactToday: asFiniteNumber(raw?.revenueImpactToday, 0),
        pulseRevenueToday: asFiniteNumber(raw?.pulseRevenueToday, 0),
        queueSnapshot: normalizeQueueSnapshot(raw?.queueSnapshot),
        incidentBanner,
    };
}

export function useDashboardStats(pageProps?: DashboardPageProps | null) {
    const initialData =
        pageProps &&
        (pageProps.guests !== undefined || pageProps.incidentsOpen !== undefined || pageProps.initialActions !== undefined)
            ? normalizeDashboardStats(pageProps)
            : undefined;

    return useQuery({
        queryKey: ['dashboard', 'stats'],
        queryFn: async () => {
            const raw = await getJsonOrFallback<Partial<DashboardStats>>('/api/ops/dashboard/stats', emptyStats());

            return normalizeDashboardStats(raw);
        },
        initialData,
        refetchInterval: 4_000,
    });
}

export function useGuests(initial?: Guest[] | null) {
    return useQuery({
        queryKey: ['guests', 'list'],
        queryFn: () => getJsonOrFallback<Guest[]>('/api/ops/guests', []),
        initialData: initial ?? undefined,
    });
}

export function useIncidents(initial?: Incident[] | null) {
    return useQuery({
        queryKey: ['incidents', 'list'],
        queryFn: () => getJsonOrFallback<Incident[]>('/api/ops/incidents', []),
        initialData: initial ?? undefined,
    });
}

export function useGuestDetail(guestId: string) {
    return useQuery({
        queryKey: ['guests', 'detail', guestId],
        queryFn: () => getJsonOrFallback<Guest | null>(`/api/ops/guests/${guestId}`, null),
        enabled: guestId.length > 0,
    });
}

export function useIncidentDetail(incidentId: string) {
    return useQuery({
        queryKey: ['incidents', 'detail', incidentId],
        queryFn: () => getJsonOrFallback<Incident | null>(`/api/ops/incidents/${incidentId}`, null),
        enabled: incidentId.length > 0,
    });
}
