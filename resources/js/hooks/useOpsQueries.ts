import { useQuery } from '@tanstack/react-query';
import type { ActionFeedItem, Guest, Incident } from '@/types/ops';

interface DashboardStats {
    guests: number;
    incidentsOpen: number;
    resolvedToday: number;
    churnScore: number;
    initialRevenueImpact: number;
    initialActions: ActionFeedItem[];
}

async function getJsonOrFallback<T>(url: string, fallback: T): Promise<T> {
    const response = await fetch(url, { headers: { Accept: 'application/json' } });

    if (!response.ok) {
return fallback;
}

    return response.json() as Promise<T>;
}

export function useDashboardStats() {
    return useQuery({
        queryKey: ['dashboard', 'stats'],
        queryFn: () =>
            getJsonOrFallback<DashboardStats>('/api/ops/dashboard/stats', {
                guests: 0,
                incidentsOpen: 0,
                resolvedToday: 0,
                churnScore: 0,
                initialRevenueImpact: 0,
                initialActions: [],
            }),
    });
}

export function useGuests() {
    return useQuery({
        queryKey: ['guests', 'list'],
        queryFn: () => getJsonOrFallback<Guest[]>('/api/ops/guests', []),
    });
}

export function useIncidents() {
    return useQuery({
        queryKey: ['incidents', 'list'],
        queryFn: () => getJsonOrFallback<Incident[]>('/api/ops/incidents', []),
    });
}

export function useGuestDetail(guestId: number) {
    return useQuery({
        queryKey: ['guests', 'detail', guestId],
        queryFn: () => getJsonOrFallback<Guest | null>(`/api/ops/guests/${guestId}`, null),
        enabled: Number.isFinite(guestId),
    });
}

export function useIncidentDetail(incidentId: number) {
    return useQuery({
        queryKey: ['incidents', 'detail', incidentId],
        queryFn: () => getJsonOrFallback<Incident | null>(`/api/ops/incidents/${incidentId}`, null),
        enabled: Number.isFinite(incidentId),
    });
}
