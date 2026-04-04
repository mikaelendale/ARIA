import { Head, usePage } from '@inertiajs/react';
import { FlaskConical, Gauge, History, MessagesSquare } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useAgentStore } from '@/app/store/useAgentStore';
import { usePulseRevenueStore } from '@/app/store/usePulseRevenueStore';
import { PromptInputBox } from '@/components/ai-prompt-box';
import { AriaChatPanel, type AriaChatMessage } from '@/components/dashboard/aria-chat-panel';
import { ActionFeed } from '@/components/dashboard/action-feed';
import { AgentStatusCard } from '@/components/dashboard/agent-status-card';
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
import { useDashboardStats, type DashboardPageProps } from '@/hooks/useOpsQueries';
import AppLayout from '@/layouts/app-layout';
import { consumeAriaChatSseStream } from '@/lib/aria-chat-stream';
import { dashboardVisibilityForRole, roleLabel } from '@/lib/aria-roles';
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
        body: 'Big numbers, simple charts, and a short story you can read in a glance. Scroll down to see what the assistant did most recently.',
    },
    operations: {
        kicker: 'Good day',
        title: 'Your shift at a glance',
        body: 'Who is staying, what still needs attention, and how busy we are — in one screen, no spreadsheet.',
    },
    floor: {
        kicker: 'Today',
        title: 'Your team snapshot',
        body: 'Start with the charts below. Open Guests or Issues from the top when you need a name or a case.',
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
    const [chatError, setChatError] = useState<string | null>(null);
    const [ariaConversationId, setAriaConversationId] = useState<string | null>(null);

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
            setChatLoading(true);
            setChatError(null);

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
                setChatError(e instanceof Error ? e.message : 'Something went wrong.');
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Overview — Kuriftu" />
            <DashboardTourProvider vis={vis} hasQueueSnapshot={queueSnapshot != null}>
                <div className="flex min-h-0 flex-1 flex-col gap-2.5 py-2 pb-28 sm:pb-24">
                    <AnimatePresence mode="wait">
                        {!chatUiOpen ? (
                            <motion.div
                                key="dashboard"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                                className="flex flex-col gap-2.5"
                            >
                                {queueSnapshot ? (
                                    <div data-tour="dashboard-queue">
                                        <QueueOpsStrip snapshot={queueSnapshot} />
                                    </div>
                                ) : null}

                                {vis.showDemoPanel ? (
                                    <div
                                        data-tour="dashboard-practice"
                                        className="aria-animate-in space-y-2 pb-1"
                                        style={{ animationDelay: '100ms' }}
                                    >
                                        <div className="border-border/50 flex items-start gap-2 border-b pb-1.5">
                                            <FlaskConical
                                                className="text-foreground/65 mt-0.5 size-3.5 shrink-0 stroke-[1.75]"
                                                aria-hidden
                                            />
                                            <div className="min-w-0 space-y-0.5">
                                                <p className="text-foreground text-sm font-semibold">Practice runs</p>
                                                <p className="text-muted-foreground max-w-xl text-[11px] leading-snug">
                                                    Safe, fake scenarios for tours and training. Tap one when you are ready
                                                    — then watch the live list below respond.
                                                </p>
                                            </div>
                                        </div>
                                        <DemoScenariosPanel />
                                    </div>
                                ) : null}

                                <DashboardOverview
                                    hero={hero}
                                    roleBadge={roleLabel(role)}
                                    stats={statsQuery.data}
                                    actions={initialActions}
                                    showPulseRevenue={vis.showPulseRevenue}
                                    showLiveHint={vis.showLiveFeed}
                                    tourButton={<DashboardTourTrigger />}
                                />

                                {(vis.showLiveFeed || vis.showSignalsColumn) && (
                                    <div
                                        data-tour="dashboard-activity"
                                        className="aria-animate-in space-y-2"
                                        style={{ animationDelay: '40ms' }}
                                    >
                                    <div className="border-border/50 flex items-center gap-2 border-b pb-1.5">
                                        <History className="text-foreground/65 size-3.5 shrink-0 stroke-[1.75]" aria-hidden />
                                        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.18em] uppercase">
                                            {vis.showLiveFeed ? 'What happened recently' : 'Side panels'}
                                        </p>
                                    </div>
                                    <div className="grid min-h-[340px] grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.12fr)_minmax(248px,1fr)]">
                                        {vis.showLiveFeed ? (
                                            <ActionFeed initialActions={initialActions} />
                                        ) : (
                                            <Card className="border-border/40 bg-muted/10 flex min-h-[200px] items-center justify-center rounded-lg border p-3">
                                                <p className="text-muted-foreground max-w-sm text-center text-sm leading-relaxed">
                                                    Your role hides the full live log. Use{' '}
                                                    <span className="text-foreground">Issues</span> or{' '}
                                                    <span className="text-foreground">Guest list</span> in the top menu
                                                    instead.
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
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 12 }}
                            transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
                            className="flex min-h-[min(72vh,calc(100dvh-10rem))] flex-1 flex-col overflow-hidden"
                        >
                            <AriaChatPanel
                                messages={chatMessages}
                                onBack={() => setChatUiOpen(false)}
                                emptyHint="Type below to reach ARIA. The overview stays one tap away."
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div
                    data-tour="dashboard-ask"
                    className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-3 sm:pb-4"
                >
                    <div className="pointer-events-auto flex w-full max-w-4xl flex-col gap-2">
                        {!chatUiOpen ? (
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="border-border/60 bg-background/90 text-foreground shadow-md backdrop-blur-sm"
                                    onClick={() => setChatUiOpen(true)}
                                >
                                    <MessagesSquare className="mr-1.5 size-4 stroke-[1.75]" aria-hidden />
                                    Chat with ARIA
                                </Button>
                            </div>
                        ) : null}
                        {chatError ? (
                            <div
                                className="border-destructive/40 bg-destructive/10 text-destructive rounded-xl border px-3 py-2 text-xs shadow-lg"
                                role="alert"
                            >
                                {chatError}
                            </div>
                        ) : null}
                        <PromptInputBox
                            onSend={(msg, files) => void sendAriaChat(msg, files)}
                            isLoading={chatLoading}
                            copy={{ defaultPlaceholder: 'Ask anything about guests, rooms, or today…' }}
                        />
                    </div>
                </div>
                </div>
            </DashboardTourProvider>
        </AppLayout>
    );
}
