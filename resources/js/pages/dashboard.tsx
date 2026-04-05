import { Head, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronUp, Gauge, MessagesSquare } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAgentStore } from '@/app/store/useAgentStore';
import { usePulseRevenueStore } from '@/app/store/usePulseRevenueStore';
import { PromptInputBox } from '@/components/ai-prompt-box';
import { ActionFeed } from '@/components/dashboard/action-feed';
import { AgentStatusCard } from '@/components/dashboard/agent-status-card';
import { AriaChatPanel } from '@/components/dashboard/aria-chat-panel';
import type { AriaChatMessage } from '@/components/dashboard/aria-chat-panel';
import { ChurnBoard } from '@/components/dashboard/churn-board';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { DashboardTourProvider, DashboardTourTrigger } from '@/components/dashboard/dashboard-tour';
import { DemoScenariosPanel } from '@/components/dashboard/demo-scenarios-panel';
import { LiveCounter } from '@/components/dashboard/live-counter';
import { QueueOpsStrip } from '@/components/dashboard/queue-ops-strip';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAgentStatus } from '@/hooks/useAgentStatus';
import { useDashboardEvents } from '@/hooks/useDashboardEvents';
import { useDashboardStats } from '@/hooks/useOpsQueries';
import type { DashboardPageProps } from '@/hooks/useOpsQueries';
import AppLayout from '@/layouts/app-layout';
import { consumeAriaChatSseStream } from '@/lib/aria-chat-stream';
import { dashboardVisibilityForRole, roleLabel } from '@/lib/aria-roles';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type { User } from '@/types/auth';

const ARIA_CHAT_URL = '/api/ops/aria/chat';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Overview',
        href: dashboard(),
    },
];

const HERO_COPY: Record<string, { kicker: string; title: string; body: string }> = {
    command: {
        kicker: 'Good day',
        title: 'Here’s how the resort looks today',
        body: 'Big numbers, simple charts, and a short story you can read in a glance. The right column shows practice runs, live activity, and status when your role allows.',
    },
    operations: {
        kicker: 'Good day',
        title: 'Your shift at a glance',
        body: 'Who is staying, what still needs attention, and how busy we are — in one screen, no spreadsheet.',
    },
    floor: {
        kicker: 'Today',
        title: 'Your team snapshot',
        body: 'Start with the charts on the left. Open Guests or Issues from the sidebar when you need a name or a case.',
    },
    'read-only': {
        kicker: 'Summary',
        title: 'Today’s headline numbers',
        body: 'High-level counts only. Ask your lead if you need the full live list.',
    },
};

type DashboardPage = { auth: { user: User } } & DashboardPageProps & { csrfToken?: string };

export default function Dashboard() {
    const page = usePage<DashboardPage>();
    const role = (page.props.auth.user.role as string) || 'viewer';
    const vis = dashboardVisibilityForRole(role);
    const hero = HERO_COPY[vis.heroVariant];

    const csrfToken = page.props.csrfToken;
    const [chatUiOpen, setChatUiOpen] = useState(false);
    const [chatLoading, setChatLoading] = useState(false);
    const [chatMessages, setChatMessages] = useState<AriaChatMessage[]>([]);
    const [ariaConversationId, setAriaConversationId] = useState<string | null>(null);
    /** Collapsed by default so the fixed composer does not cover the dashboard. */
    const [composerExpanded, setComposerExpanded] = useState(false);

    const sendAriaChat = useCallback(
        async (message: string, files?: File[]) => {
            const trimmed = message.trim();
            const fileNote =
                files && files.length > 0
                    ? ` [Attached: ${files.map((f) => f.name).join(', ')}]`
                    : '';
            const payload = trimmed + fileNote;

            if (!payload.trim() || chatLoading) {
                return;
            }

            const userId = crypto.randomUUID();
            const assistantId = crypto.randomUUID();
            setChatMessages((prev) => [
                ...prev,
                { id: userId, role: 'user', content: payload },
                { id: assistantId, role: 'assistant', content: '' },
            ]);
            setChatUiOpen(true);
            setComposerExpanded(true);
            setChatLoading(true);

            try {
                const res = await fetch(ARIA_CHAT_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'text/event-stream',
                        'X-CSRF-TOKEN': csrfToken ?? '',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify({
                        message: payload,
                        ...(ariaConversationId ? { conversation_id: ariaConversationId } : {}),
                    }),
                });

                if (!res.ok) {
                    const data = (await res.json().catch(() => ({}))) as { message?: string };

                    throw new Error(
                        typeof data.message === 'string' ? data.message : `Request failed (${res.status})`,
                    );
                }

                if (!res.body) {
                    throw new Error('No response body from ARIA.');
                }

                await consumeAriaChatSseStream(res.body, {
                    onTextDelta: (delta) => {
                        setChatMessages((prev) =>
                            prev.map((m) =>
                                m.id === assistantId ? { ...m, content: m.content + delta } : m,
                            ),
                        );
                    },
                    onConversationId: (id) => setAriaConversationId(id),
                });
            } catch (e) {
                setChatMessages((prev) => prev.filter((m) => m.id !== assistantId));
                toast.error('Message could not be sent', {
                    description: e instanceof Error ? e.message : 'Something went wrong.',
                });
            } finally {
                setChatLoading(false);
            }
        },
        [ariaConversationId, chatLoading, csrfToken],
    );

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

    const showAsideRail =
        vis.showDemoPanel || vis.showLiveFeed || vis.showSignalsColumn;

    const composerOpen = composerExpanded || chatUiOpen;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Overview — Kuriftu" />
            <DashboardTourProvider vis={vis} hasQueueSnapshot={queueSnapshot != null}>
                <div
                    className={cn(
                        'flex min-h-0 flex-1 flex-col gap-6 px-4 py-4 md:px-6 md:py-5',
                        composerOpen ? 'pb-[min(46vh,18rem)] sm:pb-[min(42vh,17rem)]' : 'pb-16 sm:pb-18',
                    )}
                >
                    {!chatUiOpen ? (
                        <>
                            {queueSnapshot ? (
                                <div data-tour="dashboard-queue">
                                    <QueueOpsStrip snapshot={queueSnapshot} />
                                </div>
                            ) : null}

                            <div
                                className={cn(
                                    'grid min-w-0 gap-6',
                                    showAsideRail && 'xl:grid-cols-[minmax(0,1.5fr)_32rem] xl:items-start xl:gap-10',
                                )}
                            >
                                <div className="min-w-0 space-y-6">
                                    <DashboardOverview
                                        hero={hero}
                                        roleBadge={roleLabel(role)}
                                        stats={statsQuery.data}
                                        actions={initialActions}
                                        showPulseRevenue={vis.showPulseRevenue}
                                        showLiveHint={vis.showLiveFeed}
                                        tourButton={<DashboardTourTrigger />}
                                    />

                                    {!vis.showSignalsColumn && vis.showChurn ? (
                                        <section className="space-y-2" aria-labelledby="dash-churn-heading">
                                            <div className="flex items-center gap-2 border-b border-border pb-2">
                                                <Gauge
                                                    className="text-muted-foreground size-3.5 shrink-0 stroke-[1.75]"
                                                    aria-hidden
                                                />
                                                <h2
                                                    id="dash-churn-heading"
                                                    className="text-muted-foreground text-[10px] font-semibold uppercase tracking-[0.16em]"
                                                >
                                                    Guest risk
                                                </h2>
                                            </div>
                                            <ChurnBoard score={churnScore} />
                                        </section>
                                    ) : null}
                                </div>

                                {showAsideRail ? (
                                    <aside
                                        className={cn(
                                            'flex min-w-0 flex-col gap-5',
                                            'xl:sticky xl:top-0 xl:pt-0.5',
                                        )}
                                    >
                                        {vis.showDemoPanel ? (
                                            <div data-tour="dashboard-practice">
                                                <DemoScenariosPanel />
                                            </div>
                                        ) : null}

                                        {(vis.showLiveFeed || vis.showSignalsColumn) && (
                                            <div
                                                data-tour="dashboard-activity"
                                                className="flex min-w-0 flex-col gap-4"
                                            >
                                                {vis.showLiveFeed ? (
                                                    <ActionFeed initialActions={initialActions} />
                                                ) : (
                                                    <Card className="flex min-h-[200px] items-center justify-center border border-border bg-muted/20 p-4 shadow-none">
                                                        <p className="text-muted-foreground max-w-sm text-center text-sm leading-relaxed">
                                                            Your role hides the full live log. Use{' '}
                                                            <span className="text-foreground">Issues</span> or{' '}
                                                            <span className="text-foreground">Guests</span> in the
                                                            sidebar instead.
                                                        </p>
                                                    </Card>
                                                )}
                                                {vis.showSignalsColumn ? (
                                                    <div className="flex flex-col gap-3">
                                                        {vis.showPulseRevenue ? <LiveCounter /> : null}
                                                        {vis.showAgents ? <AgentStatusCard /> : null}
                                                        {vis.showChurn ? <ChurnBoard score={churnScore} /> : null}
                                                    </div>
                                                ) : null}
                                            </div>
                                        )}
                                    </aside>
                                ) : null}
                            </div>
                        </>
                    ) : (
                        <div className="flex min-h-[min(72vh,calc(100dvh-10rem))] flex-1 flex-col overflow-hidden">
                            <AriaChatPanel
                                messages={chatMessages}
                                onBack={() => setChatUiOpen(false)}
                                emptyHint="Type below to reach ARIA. The overview stays one tap away."
                            />
                        </div>
                    )}
                </div>

                <div
                    data-tour="dashboard-ask"
                    className="border-border fixed inset-x-0 bottom-0 max-w-3xl mx-auto z-50 3 bg-transparent"
                >
                    {!composerOpen ? (
                        <div className="mx-auto flex max-w-3xl items-center justify-center gap-2 px-3 py-2 sm:px-4">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="h-9 flex-1 border border-border shadow-none sm:flex-none sm:px-8"
                                onClick={() => setComposerExpanded(true)}
                            >
                                <ChevronUp className="mr-2 size-4 opacity-70" aria-hidden />
                                Show ask bar
                            </Button>
                            {/* {!chatUiOpen ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-9 border-border shadow-none"
                                    onClick={() => {
                                        setComposerExpanded(true);
                                        setChatUiOpen(true);
                                    }}
                                >
                                    <MessagesSquare className="mr-1.5 size-4 stroke-[1.75]" aria-hidden />
                                    Open chat
                                </Button>
                            ) : null} */}
                        </div>
                    ) : (
                        <div className="mx-auto flex max-w-3xl flex-col gap-2 px-3 py-3 sm:px-4">
                            {!chatUiOpen ? (
                                <div className="flex items-center justify-between gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 shrink-0 border-border shadow-none"
                                        onClick={() => setChatUiOpen(true)}
                                    >
                                        <MessagesSquare className="mr-1.5 size-4 stroke-[1.75]" aria-hidden />
                                        Chat with ARIA
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-muted-foreground h-8 shrink-0 gap-1 px-2"
                                        onClick={() => setComposerExpanded(false)}
                                    >
                                        <ChevronDown className="size-4" aria-hidden />
                                        Hide
                                    </Button>
                                </div>
                            ) : null}
                            <PromptInputBox
                                onSend={(msg, files) => void sendAriaChat(msg, files)}
                                isLoading={chatLoading}
                                copy={{ defaultPlaceholder: 'Ask anything about guests, rooms, or today…' }}
                            />
                        </div>
                    )}
                </div>
            </DashboardTourProvider>
        </AppLayout>
    );
}
