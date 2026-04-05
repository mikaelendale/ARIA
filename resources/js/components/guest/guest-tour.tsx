import { Map } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import { HERMES } from '@/components/guest/hermes-brand';
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
import { cn } from '@/lib/utils';

export const GUEST_KIOSK_TOUR_STORAGE_KEY = 'aria-guest-kiosk-tour-seen';

export function hasGuestKioskTourCompleted(): boolean {
    try {
        return localStorage.getItem(GUEST_KIOSK_TOUR_STORAGE_KEY) === '1';
    } catch {
        return false;
    }
}

export function markGuestKioskTourSeen(): void {
    try {
        localStorage.setItem(GUEST_KIOSK_TOUR_STORAGE_KEY, '1');
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

function buildGuestSteps(): TourStepDef[] {
    return [
        {
            target: '[data-tour="guest-intro"]',
            step: (
                <div className="space-y-1">
                    <p className="text-primary font-medium tracking-wide uppercase">Hermes kiosk</p>
                    <TourTitle>Voice agent of ARIA</TourTitle>
                    <TourLead>
                        <span className="text-foreground font-medium">{HERMES.name}</span> is the dedicated voice
                        channel in the ARIA stack: bilingual Amharic & English for Kuriftu Resort, Twilio + OpenAI
                        Realtime, and the <span className="text-foreground font-medium">same orchestrator tools</span> as
                        text ARIA — see <code className="text-foreground font-mono text-xs">HermesAgent.php</code>.
                    </TourLead>
                    <TourList
                        items={[
                            'Left: 3D orb — live preview of listening / speaking states.',
                            'Right: tabbed guest surfaces — outbound messages, live ops feed, today at a glance.',
                            'Built for demo & judging: mock data; production wires Media Streams + worker.',
                        ]}
                    />
                </div>
            ),
        },
        {
            target: '[data-tour="guest-voice"]',
            step: (
                <div>
                    <p className="text-primary font-medium tracking-wide uppercase">{HERMES.name}</p>
                    <TourTitle>Realtime voice surface</TourTitle>
                    <TourLead>
                        This orb visualizes what guests experience on a voice call:{' '}
                        <span className="text-foreground font-medium">Idle</span>,{' '}
                        <span className="text-foreground font-medium">Listening</span>, and{' '}
                        <span className="text-foreground font-medium">Talking</span> map to Hermes session states.
                        Production pairs this UX with a persistent Realtime worker — PHP-FPM hands off to the bridge
                        described in the agent class.
                    </TourLead>
                </div>
            ),
        },
        {
            target: '[data-tour="guest-tabs"]',
            step: (
                <div>
                    <p className="text-primary font-medium tracking-wide uppercase">Guest channels</p>
                    <TourTitle>One screen, three lenses</TourTitle>
                    <TourLead>
                        <span className="text-foreground font-medium">Messages</span> — Hermes-style outbound WhatsApp
                        copy. <span className="text-foreground font-medium">Live</span> — what’s moving on property.{' '}
                        <span className="text-foreground font-medium">Today</span> — clock, weather, hours, Wi‑Fi,
                        events. Judges: this is the guest-facing half of the same ops brain that powers the dashboard.
                    </TourLead>
                </div>
            ),
        },
    ];
}

function GuestTourPanels({ reduceMotion }: { reduceMotion: boolean }) {
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

export function GuestKioskTourProvider({ children }: { children: ReactNode }) {
    const steps = useMemo(() => buildGuestSteps(), []);
    const reduceMotion = useSyncExternalStore(
        subscribeReducedMotion,
        getReducedMotionSnapshot,
        getReducedMotionServerSnapshot,
    );

    return (
        <Tour steps={steps} onClose={() => markGuestKioskTourSeen()} closeOnBackdrop>
            {children}
            <GuestTourPanels reduceMotion={reduceMotion} />
            <GuestKioskTourAutoStart />
        </Tour>
    );
}

function GuestKioskTourAutoStart() {
    const { open } = useTour();

    useEffect(() => {
        if (hasGuestKioskTourCompleted()) {
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

export function GuestKioskTourTrigger() {
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
                'h-8 gap-1.5 rounded-md border-border bg-background text-xs font-medium shadow-none',
                !reduceMotion && 'aria-quick-tour-jump',
            )}
            onClick={() => open()}
        >
            <Map className="size-3.5 opacity-80" aria-hidden />
            Hermes tour
        </Button>
    );
}
