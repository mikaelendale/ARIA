import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Building2, Radio, Users } from 'lucide-react';
import { useEffect } from 'react';
import { useAgentStore } from '@/app/store/useAgentStore';
import { usePulseRevenueStore } from '@/app/store/usePulseRevenueStore';
import { ActionFeed } from '@/components/dashboard/action-feed';
import { AgentStatusCard } from '@/components/dashboard/agent-status-card';
import { ChurnBoard } from '@/components/dashboard/churn-board';
import { DemoScenariosPanel } from '@/components/dashboard/demo-scenarios-panel';
import { LiveCounter } from '@/components/dashboard/live-counter';
import { QueueOpsStrip } from '@/components/dashboard/queue-ops-strip';
import { TopStatsBar } from '@/components/dashboard/top-stats-bar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useAgentStatus } from '@/hooks/useAgentStatus';
import { useDashboardEvents } from '@/hooks/useDashboardEvents';
import { useDashboardStats, type DashboardPageProps } from '@/hooks/useOpsQueries';
import AppLayout from '@/layouts/app-layout';
import { dashboardVisibilityForRole, roleLabel } from '@/lib/aria-roles';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type { User } from '@/types/auth';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
];

const HERO_COPY: Record<string, { kicker: string; title: string; body: string }> = {
    command: {
        kicker: 'Command',
        title: 'ARIA ops',
        body: 'Agent activity, queues, and property signals in one scan. Below is what ran — plus what is waiting in workers.',
    },
    operations: {
        kicker: 'Operations',
        title: 'Live desk',
        body: 'Watch the feed and queue depth while scenarios and webhooks run through the stack.',
    },
    floor: {
        kicker: 'Team',
        title: 'Floor view',
        body: 'Prioritize the action stream and risk; drill into guests or incidents when needed.',
    },
    'read-only': {
        kicker: 'Overview',
        title: 'Snapshot',
        body: 'High-level posture; operations owns agent tooling and demos.',
    },
};

function QuickLinks() {
    const links = [
        { href: '/guests', title: 'Guests', desc: 'Churn · VIP · last touch', icon: Users },
        { href: '/incidents', title: 'Incidents', desc: 'Open cases · severity', icon: Building2 },
    ];

    return (
        <div className="grid gap-2 sm:grid-cols-2">
            {links.map((item) => (
                <Link key={item.href} href={item.href} prefetch>
                    <Card className="border-border/40 bg-transparent hover:bg-muted/20 rounded-md border px-3 py-2.5 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <item.icon className="text-muted-foreground size-4" />
                                <div>
                                    <p className="text-sm font-medium">{item.title}</p>
                                    <p className="text-muted-foreground text-[11px]">{item.desc}</p>
                                </div>
                            </div>
                            <ArrowRight className="text-muted-foreground size-3.5 shrink-0" />
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    );
}

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
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-4 py-4">
                <header className="aria-animate-in flex flex-col gap-3 border-border/40 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1">
                        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.22em] uppercase">{hero.kicker}</p>
                        <h1 className="text-foreground text-2xl font-semibold tracking-tight">{hero.title}</h1>
                        <p className="text-muted-foreground max-w-xl text-xs leading-relaxed">{hero.body}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <Badge variant="outline" className="rounded font-mono text-[10px] font-normal tracking-wide">
                            {roleLabel(role)}
                        </Badge>
                        {vis.showLiveFeed ? (
                            <span className="text-muted-foreground inline-flex items-center gap-1.5 font-mono text-[10px]">
                                <span className="aria-live-dot size-1.5 rounded-full bg-emerald-500" />
                                <Radio className="size-3 opacity-70" />
                                Live
                            </span>
                        ) : null}
                    </div>
                </header>

                <QueueOpsStrip snapshot={queueSnapshot} />

                {vis.showDemoPanel ? (
                    <div className="aria-animate-in" style={{ animationDelay: '40ms' }}>
                        <DemoScenariosPanel />
                    </div>
                ) : null}

                <div className="aria-animate-in" style={{ animationDelay: '70ms' }}>
                    <TopStatsBar
                        guests={statsQuery.data?.guests ?? 0}
                        incidentsOpen={statsQuery.data?.incidentsOpen ?? 0}
                        resolvedToday={statsQuery.data?.resolvedToday ?? 0}
                        occupancyPercent={statsQuery.data?.occupancyPercent ?? 0}
                        revenue={statsQuery.data?.revenueImpactToday ?? 0}
                    />
                </div>

                {vis.showQuickLinks ? (
                    <div className="aria-animate-in space-y-2" style={{ animationDelay: '100ms' }}>
                        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.22em] uppercase">Rosters</p>
                        <QuickLinks />
                    </div>
                ) : null}

                {(vis.showLiveFeed || vis.showSignalsColumn) && (
                    <div className="aria-animate-in space-y-2" style={{ animationDelay: '130ms' }}>
                        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.22em] uppercase">
                            {vis.showLiveFeed ? 'Agent activity' : 'Signals'}
                        </p>
                        <div className="grid min-h-[420px] grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.12fr)_minmax(260px,1fr)]">
                            {vis.showLiveFeed ? (
                                <ActionFeed initialActions={initialActions} />
                            ) : (
                                <Card className="border-border/40 bg-muted/10 flex min-h-[240px] items-center justify-center rounded-md border p-5">
                                    <p className="text-muted-foreground max-w-sm text-center text-xs leading-relaxed">
                                        Action feed is restricted for this role. Open Incidents or Guests for detail.
                                    </p>
                                </Card>
                            )}
                            {vis.showSignalsColumn && (
                                <div className="flex flex-col gap-3">
                                    {vis.showPulseRevenue && <LiveCounter />}
                                    {vis.showAgents && <AgentStatusCard />}
                                    {vis.showChurn && <ChurnBoard score={churnScore} />}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {!vis.showSignalsColumn && vis.showChurn && (
                    <div className="max-w-md space-y-2">
                        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.22em] uppercase">Risk</p>
                        <ChurnBoard score={churnScore} />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
