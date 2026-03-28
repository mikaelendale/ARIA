import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import { useActionFeedStore } from '@/app/store/useActionFeedStore';
import { useAgentStore } from '@/app/store/useAgentStore';
import { useRevenueStore } from '@/app/store/useRevenueStore';
import { ActionFeed } from '@/components/dashboard/action-feed';
import { AgentStatusCard } from '@/components/dashboard/agent-status-card';
import { ChurnBoard } from '@/components/dashboard/churn-board';
import { LiveRevenueCard } from '@/components/dashboard/live-revenue-card';
import { TopStatsBar } from '@/components/dashboard/top-stats-bar';
import { useAgentStatus } from '@/hooks/useAgentStatus';
import { useDashboardEvents } from '@/hooks/useDashboardEvents';
import { useDashboardStats } from '@/hooks/useOpsQueries';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
];

export default function Dashboard() {
    useDashboardEvents();
    useAgentStatus();

    const statsQuery = useDashboardStats();
    const setInitialActions = useActionFeedStore((state) => state.setInitialActions);
    const setTotalRevenue = useRevenueStore((state) => state.setTotalRevenue);
    const computeStatus = useAgentStore((state) => state.computeStatus);

    useEffect(() => {
        if (!statsQuery.data) {
return;
}

        setInitialActions(statsQuery.data.initialActions);
        setTotalRevenue(statsQuery.data.initialRevenueImpact);
    }, [statsQuery.data, setInitialActions, setTotalRevenue]);

    useEffect(() => {
        computeStatus();
        const interval = window.setInterval(computeStatus, 30_000);

        return () => window.clearInterval(interval);
    }, [computeStatus]);

    const churnScore = statsQuery.data?.churnScore ?? 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <TopStatsBar
                    guests={statsQuery.data?.guests ?? 0}
                    incidentsOpen={statsQuery.data?.incidentsOpen ?? 0}
                    resolvedToday={statsQuery.data?.resolvedToday ?? 0}
                    revenue={statsQuery.data?.initialRevenueImpact ?? 0}
                />
                <div className="grid min-h-[640px] grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
                    <ActionFeed />
                    <div className="space-y-4">
                        <LiveRevenueCard />
                        <AgentStatusCard />
                        <ChurnBoard score={churnScore} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
