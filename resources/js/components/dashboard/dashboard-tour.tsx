import { Map } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import {
    Tour,
    TourArrow,
    TourContent,
    TourFooter,
    TourOverlay,
    TourStep,
    useTour,
    type TourStepDef,
} from '@/components/ui/tour';
import type { DashboardVisibility } from '@/lib/aria-roles';
import { cn } from '@/lib/utils';

export const DASHBOARD_TOUR_STORAGE_KEY = 'aria-dashboard-tour-seen';

export function hasDashboardTourCompleted(): boolean {
    try {
        return localStorage.getItem(DASHBOARD_TOUR_STORAGE_KEY) === '1';
    } catch {
        return false;
    }
}

export function markDashboardTourSeen(): void {
    try {
        localStorage.setItem(DASHBOARD_TOUR_STORAGE_KEY, '1');
    } catch {
        /* ignore */
    }
}

function TourTitle({ children }: { children: ReactNode }) {
    return <p className="text-foreground text-[15px] font-semibold leading-snug">{children}</p>;
}

function TourLead({ children }: { children: ReactNode }) {
    return <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{children}</p>;
}

function TourList({ items }: { items: string[] }) {
    return (
        <ul className="text-muted-foreground mt-3 list-disc space-y-1.5 pl-4 text-sm leading-relaxed">
            {items.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    );
}

function subscribeReducedMotion(callback: () => void): () => void {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    mq.addEventListener('change', callback);

    return () => mq.removeEventListener('change', callback);
}

function getReducedMotionSnapshot(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getReducedMotionServerSnapshot(): boolean {
    return false;
}

function buildSteps(vis: DashboardVisibility, hasQueueSnapshot: boolean): TourStepDef[] {
    const steps: TourStepDef[] = [];
    const showAsideRail = vis.showDemoPanel || vis.showLiveFeed || vis.showSignalsColumn;
    const showMainChurnSection = vis.showChurn && !vis.showSignalsColumn;

    steps.push({
        target: '[data-tour="dashboard-main"]',
        step: (
            <div className="space-y-1">
                <p className="text-primary font-medium tracking-wide uppercase">Welcome</p>
                <TourTitle>Your Kuriftu ARIA overview</TourTitle>
                <TourLead>
                    This screen is your home base: a live snapshot of the resort built from the same data we use in
                    operations—guests, rooms, issues, and what the AI agents have done recently. Take this short tour
                    to see how each section fits together.
                </TourLead>
                <TourList
                    items={[
                        'Numbers refresh on a short interval so you are not looking at stale counts.',
                        'What you see may depend on your role; sensitive columns stay hidden when needed.',
                    ]}
                />
            </div>
        ),
    });

    if (hasQueueSnapshot) {
        steps.push({
            target: '[data-tour="dashboard-queue"]',
            step: (
                <div>
                    <TourTitle>Background jobs and queues</TourTitle>
                    <TourLead>
                        ARIA runs work through named queues (Core, Pulse, Vera, Sentinel, Nexus, Echo). The strip shows
                        how many jobs are waiting per queue and how many jobs failed in the last day.
                    </TourLead>
                    <TourList
                        items={[
                            'Pending counts usually move as workers process tasks—brief spikes are normal.',
                            'If failed jobs climb, your team may need to check workers or logs; it is an ops health signal.',
                        ]}
                    />
                </div>
            ),
        });
    }

    steps.push({
        target: '[data-tour="dashboard-welcome"]',
        step: (
            <div>
                <TourTitle>Greeting and context</TourTitle>
                <TourLead>
                    The top card sets the tone for your shift: a short headline, your role badge, and (when enabled) a
                    live hint that data is updating. On the right you will often see average departure risk—an estimate
                    from guest profiles, not a guarantee.
                </TourLead>
                <TourLead>
                    Use <span className="text-foreground font-medium">Guided tour</span> any time to replay this guide.
                </TourLead>
            </div>
        ),
    });

    steps.push({
        target: '[data-tour="dashboard-shortcuts"]',
        step: (
            <div>
                <TourTitle>Shortcuts</TourTitle>
                <TourLead>
                    Jump straight to money, people, or problems. These mirror the sidebar so you can move quickly
                    whether you prefer the rail or the header.
                </TourLead>
                <TourList
                    items={[
                        'Revenue — booking and AI-attributed impact over the last window.',
                        'Guests — who is on property and risk signals.',
                        'Issues — open and recent incidents.',
                    ]}
                />
            </div>
        ),
    });

    steps.push({
        target: '[data-tour="dashboard-glance"]',
        step: (
            <div>
                <TourTitle>At a glance</TourTitle>
                <TourLead>
                    Each tile pairs a headline number with a tiny trailing-week sparkline so you can sense direction,
                    not only the current value. Hover a chart for a bit more context.
                </TourLead>
                <TourList
                    items={[
                        'Guests, open issues, and cleared-today tell you load and housekeeping of work.',
                        'Occupancy is the share of rooms marked occupied.',
                        vis.showPulseRevenue
                            ? 'AI-linked revenue is ETB from logged agent actions today (not full accounting).'
                            : 'Some revenue tiles are hidden for your role.',
                    ]}
                />
            </div>
        ),
    });

    if (showMainChurnSection) {
        steps.push({
            target: '[data-tour="dashboard-churn"]',
            step: (
                <div>
                    <TourTitle>Guest risk</TourTitle>
                    <TourLead>
                        When this block appears under the charts, it summarizes average departure dissatisfaction risk
                        from churn scores on guest profiles. Open a guest for the full story—this is a compass, not a
                        verdict.
                    </TourLead>
                </div>
            ),
        });
    }

    if (showAsideRail) {
        steps.push({
            target: '[data-tour="dashboard-rail"]',
            step: (
                <div>
                    <TourTitle>Practice and live signals</TourTitle>
                    <TourLead>
                        The right column keeps training and monitoring in one place on wide screens. On smaller
                        breakpoints it stacks below—scroll the page if you do not see it yet.
                    </TourLead>
                    <TourList
                        items={[
                            ...(vis.showDemoPanel
                                ? [
                                      'Demo scenarios run safe, scripted flows so you can rehearse without touching real guests.',
                                  ]
                                : []),
                            ...(vis.showLiveFeed
                                ? [
                                      'Live activity lists recent agent actions: who ran which tool and any revenue note attached.',
                                  ]
                                : []),
                            ...(vis.showSignalsColumn
                                ? [
                                      'Extra cards can include pulse-style revenue, agent heartbeat, or churn when your role allows.',
                                  ]
                                : []),
                        ]}
                    />
                </div>
            ),
        });
    }

    steps.push({
        target: '[data-tour="dashboard-ask"]',
        step: (
            <div>
                <TourTitle>Chat with ARIA</TourTitle>
                <TourLead>
                    Tap <span className="text-foreground font-medium">Open chat</span> to start a conversation in the
                    main column. Answers stream in token by token while the model works; you can keep asking follow-ups
                    in the same thread. Use <span className="text-foreground font-medium">Overview</span> in chat to
                    step back here anytime.
                </TourLead>
            </div>
        ),
    });

    return steps;
}

type ProviderProps = {
    children: ReactNode;
    vis: DashboardVisibility;
    hasQueueSnapshot: boolean;
};

function DashboardTourPanels({ reduceMotion }: { reduceMotion: boolean }) {
    const { currentStep } = useTour();

    return (
        <>
            <TourOverlay />
            <TourContent>
                <TourArrow />
                <TourStep />
                <TourFooter
                    nextButtonClassName={cn(!reduceMotion && 'aria-tour-cta-pop')}
                    prevButtonClassName={cn(!reduceMotion && currentStep > 0 && 'aria-tour-cta-pop')}
                />
            </TourContent>
        </>
    );
}

export function DashboardTourProvider({ children, vis, hasQueueSnapshot }: ProviderProps) {
    const steps = useMemo(() => buildSteps(vis, hasQueueSnapshot), [vis, hasQueueSnapshot]);
    const reduceMotion = useSyncExternalStore(
        subscribeReducedMotion,
        getReducedMotionSnapshot,
        getReducedMotionServerSnapshot,
    );

    return (
        <Tour steps={steps} onClose={() => markDashboardTourSeen()} closeOnBackdrop>
            {children}
            <DashboardTourPanels reduceMotion={reduceMotion} />
            <DashboardTourAutoStart />
        </Tour>
    );
}

/** Opens the tour once per browser until the user finishes or closes it (see localStorage). */
function DashboardTourAutoStart() {
    const { open } = useTour();

    useEffect(() => {
        if (hasDashboardTourCompleted()) {
            return;
        }

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const id = window.setTimeout(() => {
            open();
        }, 750);

        return () => window.clearTimeout(id);
    }, [open]);

    return null;
}

export function DashboardTourTrigger() {
    const { open } = useTour();
    const reduceMotion = useSyncExternalStore(
        subscribeReducedMotion,
        getReducedMotionSnapshot,
        getReducedMotionServerSnapshot,
    );

    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
                'h-8 gap-1.5 rounded-sm border-border bg-background text-xs font-medium shadow-none',
                !reduceMotion && 'aria-quick-tour-jump',
            )}
            onClick={() => open()}
        >
            <Map className="size-3.5 opacity-80" aria-hidden />
            Guided tour
        </Button>
    );
}
