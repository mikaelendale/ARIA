import { Head, usePage } from '@inertiajs/react';
import { FlaskConical, Gauge, History } from 'lucide-react';
import { useEffect } from 'react';
import { useAgentStore } from '@/app/store/useAgentStore';
import { usePulseRevenueStore } from '@/app/store/usePulseRevenueStore';
import { ActionFeed } from '@/components/dashboard/action-feed';
import { AgentStatusCard } from '@/components/dashboard/agent-status-card';
import { ChurnBoard } from '@/components/dashboard/churn-board';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { DemoScenariosPanel } from '@/components/dashboard/demo-scenarios-panel';
import { LiveCounter } from '@/components/dashboard/live-counter';
import { QueueOpsStrip } from '@/components/dashboard/queue-ops-strip';
import { Card } from '@/components/ui/card';
import { useAgentStatus } from '@/hooks/useAgentStatus';
import { useDashboardEvents } from '@/hooks/useDashboardEvents';
import { useDashboardStats  } from '@/hooks/useOpsQueries';
import type {DashboardPageProps} from '@/hooks/useOpsQueries';
import AppLayout from '@/layouts/app-layout';
import { dashboardVisibilityForRole, roleLabel } from '@/lib/aria-roles';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type { User } from '@/types/auth';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Overview',
        href: dashboard(),
    },
];

const HERO_COPY: Record<string, { kicker: string; title: string; body: string }> = {
    command: {
        kicker: 'Good day',
        title: 'Your resort is speaking plainly',
        body: 'We pulled the big numbers, a gentle pulse line, and a few friendly charts so you can see the story in seconds — then scroll to what ARIA did last.',
    },
    operations: {
        kicker: 'Good day',
        title: 'Operations snapshot',
        body: 'Same snapshot for every shift: who is here, what is open, where the queues are, and what the AI touched — without opening a spreadsheet.',
    },
    floor: {
        kicker: 'Today',
        title: 'Team snapshot',
        body: 'Start with the charts and the pulse line; dip into Guests or Issues when you need a name or a case. No jargon required.',
    },
    'read-only': {
        kicker: 'Summary',
        title: 'High-level read',
        body: 'Counts and charts only. Ask operations for the full live feed if you need step-by-step detail.',
    },
};

export default function Dashboard() {
    const page = usePage<{ auth: { user: User } } & DashboardPageProps>();
    const role = (page.props.auth.user.role as string) || 'viewer';
    const vis = dashboardVisibilityForRole(role);
    const hero = HERO_COPY[vis.heroVariant];

    useDashboardEvents();
    useAgentStatus();

    const statsQuery = useDashboardStats(page.props);
    const setPulseRevenueToday = usePulseRevenueStore((state) => state.setPulseRevenueToday);
    const computeStatus = useAgentStore((state) => state.computeStatus);

    useEffect(() => {
        if (!statsQuery.data || !vis.showPulseRevenue) {
            return;
        }

        setPulseRevenueToday(statsQuery.data.pulseRevenueToday);
    }, [statsQuery.data, setPulseRevenueToday, vis.showPulseRevenue]);

    useEffect(() => {
        if (!vis.showAgents) {
            return;
        }

        computeStatus();
        const interval = window.setInterval(computeStatus, 30_000);

        return () => window.clearInterval(interval);
    }, [computeStatus, vis.showAgents]);

    const churnScore = statsQuery.data?.churnScore ?? 0;
    const initialActions = statsQuery.data?.initialActions;
    const queueSnapshot = statsQuery.data?.queueSnapshot;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Overview — Kuriftu" />
            <div className="flex flex-1 flex-col gap-2.5 py-2">
                <QueueOpsStrip snapshot={queueSnapshot} />

                <DashboardOverview
                    hero={hero}
                    roleBadge={roleLabel(role)}
                    stats={statsQuery.data}
                    actions={initialActions}
                    showPulseRevenue={vis.showPulseRevenue}
                    showLiveHint={vis.showLiveFeed}
                />

                {(vis.showLiveFeed || vis.showSignalsColumn) && (
                    <div className="aria-animate-in space-y-2" style={{ animationDelay: '40ms' }}>
                        <div className="border-border/50 flex items-center gap-2 border-b pb-1.5">
                            <History className="text-foreground/65 size-3.5 shrink-0 stroke-[1.75]" aria-hidden />
                            <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.18em] uppercase">
                                {vis.showLiveFeed ? 'What ARIA did last' : 'Side panels'}
                            </p>
                        </div>
                        <div className="grid min-h-[340px] grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.12fr)_minmax(248px,1fr)]">
                            {vis.showLiveFeed ? (
                                <ActionFeed initialActions={initialActions} />
                            ) : (
                                <Card className="border-border/40 bg-muted/10 flex min-h-[200px] items-center justify-center rounded-lg border p-3">
                                    <p className="text-muted-foreground max-w-sm text-center text-sm leading-relaxed">
                                        Your role hides the full live log. Use <span className="text-foreground">Issues</span>{' '}
                                        or <span className="text-foreground">Guest list</span> in the top menu instead.
                                    </p>
                                </Card>
                            )}
                            {vis.showSignalsColumn && (
                                <div className="flex flex-col gap-2">
                                    {vis.showPulseRevenue && <LiveCounter />}
                                    {vis.showAgents && <AgentStatusCard />}
                                    {vis.showChurn && <ChurnBoard score={churnScore} />}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {!vis.showSignalsColumn && vis.showChurn && (
                    <div className="max-w-md space-y-1.5">
                        <div className="border-border/50 flex items-center gap-2 border-b pb-1.5">
                            <Gauge className="text-foreground/65 size-3.5 shrink-0 stroke-[1.75]" aria-hidden />
                            <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.18em] uppercase">
                                Guest risk
                            </p>
                        </div>
                        <ChurnBoard score={churnScore} />
                    </div>
                )}

                {vis.showDemoPanel ? (
                    <div className="aria-animate-in space-y-2 pb-1" style={{ animationDelay: '100ms' }}>
                        <div className="border-border/50 flex items-start gap-2 border-b pb-1.5">
                            <FlaskConical className="text-foreground/65 mt-0.5 size-3.5 shrink-0 stroke-[1.75]" aria-hidden />
                            <div className="min-w-0 space-y-0.5">
                                <p className="text-foreground text-sm font-semibold">Practice runs</p>
                                <p className="text-muted-foreground max-w-xl text-[11px] leading-snug">
                                    Safe, fake scenarios for tours and training. Tap one when you are ready — then watch the
                                    live list above respond.
                                </p>
                            </div>
                        </div>
                        <DemoScenariosPanel />
                    </div>
                ) : null}
            </div>
        </AppLayout>
    );
}
