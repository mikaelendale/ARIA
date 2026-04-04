import '@reactour/tour/dist/index.css';

import { Button } from '@/components/ui/button';
import type { DashboardVisibility } from '@/lib/aria-roles';
import { TourProvider, useTour, type StepType } from '@reactour/tour';
import { Map } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';

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

function buildSteps(vis: DashboardVisibility, hasQueueSnapshot: boolean): StepType[] {
    const steps: StepType[] = [];

    if (hasQueueSnapshot) {
        steps.push({
            selector: '[data-tour="dashboard-queue"]',
            content: (
                <div className="space-y-2 text-sm leading-relaxed">
                    <p className="font-semibold text-foreground">Behind-the-scenes work</p>
                    <p className="text-muted-foreground">
                        When something is “waiting in line,” the hotel systems are still working. All clear usually
                        means everything is keeping up.
                    </p>
                </div>
            ),
        });
    }

    if (vis.showDemoPanel) {
        steps.push({
            selector: '[data-tour="dashboard-practice"]',
            content: (
                <div className="space-y-2 text-sm leading-relaxed">
                    <p className="font-semibold text-foreground">Practice (safe to try)</p>
                    <p className="text-muted-foreground">
                        Training scenarios only. They help you learn without touching real guests.
                    </p>
                </div>
            ),
        });
    }

    steps.push(
        {
            selector: '[data-tour="dashboard-welcome"]',
            content: (
                <div className="space-y-2 text-sm leading-relaxed">
                    <p className="font-semibold text-foreground">Your overview</p>
                    <p className="text-muted-foreground">
                        This card greets you and shows your role. Everything below builds on what you see here.
                    </p>
                </div>
            ),
        },
        {
            selector: '[data-tour="dashboard-shortcuts"]',
            content: (
                <div className="space-y-2 text-sm leading-relaxed">
                    <p className="font-semibold text-foreground">Jump to common tasks</p>
                    <p className="text-muted-foreground">
                        Open money, guest list, or issues in one tap — same places as the top menu.
                    </p>
                </div>
            ),
        },
        {
            selector: '[data-tour="dashboard-glance"]',
            content: (
                <div className="space-y-2 text-sm leading-relaxed">
                    <p className="font-semibold text-foreground">Numbers at a glance</p>
                    <p className="text-muted-foreground">
                        Small charts show how today compares to the past week. Hover a chart for a bit more detail.
                    </p>
                </div>
            ),
        },
    );

    if (vis.showLiveFeed) {
        steps.push({
            selector: '[data-tour="dashboard-activity"]',
            content: (
                <div className="space-y-2 text-sm leading-relaxed">
                    <p className="font-semibold text-foreground">What happened recently</p>
                    <p className="text-muted-foreground">
                        A plain-language log of helpful steps the assistant took — messages, updates, and checks.
                    </p>
                </div>
            ),
        });
    }

    steps.push({
        selector: '[data-tour="dashboard-ask"]',
        content: (
            <div className="space-y-2 text-sm leading-relaxed">
                <p className="font-semibold text-foreground">Ask anything</p>
                <p className="text-muted-foreground">
                    Type a question at the bottom anytime. The overview stays here when you are done chatting.
                </p>
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

export function DashboardTourProvider({ children, vis, hasQueueSnapshot }: ProviderProps) {
    const steps = useMemo(() => buildSteps(vis, hasQueueSnapshot), [vis, hasQueueSnapshot]);

    return (
        <TourProvider
            steps={steps}
            showNavigation
            showPrevNextButtons
            showCloseButton
            showBadge
            disableDotsNavigation={false}
            scrollSmooth
            padding={{ mask: 8, popover: 12 }}
            onClickClose={() => {
                markDashboardTourSeen();
            }}
            styles={{
                popover: (base) => ({
                    ...base,
                    borderRadius: 12,
                    maxWidth: 320,
                }),
                maskArea: (base) => ({
                    ...base,
                    rx: 12,
                }),
                badge: (base) => ({
                    ...base,
                    fontSize: 11,
                }),
            }}
            nextButton={({ currentStep, stepsLength, setCurrentStep, setIsOpen }) => {
                const last = currentStep === stepsLength - 1;
                return (
                    <Button
                        type="button"
                        size="sm"
                        className="rounded-md"
                        onClick={() => {
                            if (last) {
                                markDashboardTourSeen();
                                setIsOpen(false);
                            } else {
                                setCurrentStep((s) => s + 1);
                            }
                        }}
                    >
                        {last ? 'Done' : 'Next'}
                    </Button>
                );
            }}
            prevButton={({ currentStep, setCurrentStep }) => (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-md"
                    disabled={currentStep === 0}
                    onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                >
                    Back
                </Button>
            )}
        >
            {children}
            <DashboardTourAutoStart />
        </TourProvider>
    );
}

/** Opens the tour once per browser until the user finishes or closes it (see localStorage). */
function DashboardTourAutoStart() {
    const { setIsOpen } = useTour();

    useEffect(() => {
        if (hasDashboardTourCompleted()) {
            return;
        }

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const id = window.setTimeout(() => {
            setIsOpen(true);
        }, 750);

        return () => window.clearTimeout(id);
    }, [setIsOpen]);

    return null;
}

export function DashboardTourTrigger() {
    const { setIsOpen } = useTour();

    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-full border-border/70 bg-background/80 text-xs font-medium shadow-sm backdrop-blur-sm"
            onClick={() => setIsOpen(true)}
        >
            <Map className="size-3.5 opacity-80" aria-hidden />
            Quick tour
        </Button>
    );
}
