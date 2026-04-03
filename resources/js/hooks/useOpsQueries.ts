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
        queueSnapshot: {
            connection: 'sync',
            pendingByQueue: {},
            pendingTotal: 0,
            failedLast24h: 0,
        },
    };
}

export function useDashboardStats(pageProps?: DashboardPageProps | null) {
    const initialData =
        pageProps &&
        (pageProps.guests !== undefined || pageProps.incidentsOpen !== undefined || pageProps.initialActions !== undefined)
            ? {
                  guests: pageProps.guests ?? 0,
                  incidentsOpen: pageProps.incidentsOpen ?? 0,
                  resolvedToday: pageProps.resolvedToday ?? 0,
                  churnScore: pageProps.churnScore ?? 0,
                  initialRevenueImpact: pageProps.initialRevenueImpact ?? 0,
                  initialActions: pageProps.initialActions ?? [],
                  occupancyPercent: pageProps.occupancyPercent ?? 0,
                  revenueImpactToday: pageProps.revenueImpactToday ?? 0,
                  pulseRevenueToday: pageProps.pulseRevenueToday ?? 0,
                  queueSnapshot: pageProps.queueSnapshot ?? emptyStats().queueSnapshot,
              }
            : undefined;

    return useQuery({
        queryKey: ['dashboard', 'stats'],
        queryFn: () => getJsonOrFallback<DashboardStats>('/api/ops/dashboard/stats', emptyStats()),
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
