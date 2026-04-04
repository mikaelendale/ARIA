import { usePage } from '@inertiajs/react';
import { ChevronDown, Loader2, Play } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import trigger from '@/routes/api/trigger';

type ScenarioKey = 'room_delay' | 'angry_tweet' | 'occupancy_spike' | 'guest_churn';

const SCENARIOS: {
    id: ScenarioKey;
    title: string;
    plain: string;
    outcome: string;
}[] = [
    {
        id: 'room_delay',
        title: 'Late room service',
        plain: 'Pretends a guest’s order has been waiting a long time.',
        outcome: 'You should see check-ins with the kitchen, manager alert, and a WhatsApp-style step in the activity list.',
    },
    {
        id: 'angry_tweet',
        title: 'Unhappy post online',
        plain: 'Pretends someone complained publicly about the stay.',
        outcome: 'Watch for a drafted reply and a recovery message path in the activity list.',
    },
    {
        id: 'occupancy_spike',
        title: 'Hotel fills up',
        plain: 'Marks many rooms as occupied so pricing can react.',
        outcome: 'Pricing and “extra revenue today” style numbers may move on the right.',
    },
    {
        id: 'guest_churn',
        title: 'Guest may leave unhappy',
        plain: 'Adds context so the loyalty helper raises the risk score.',
        outcome: 'Expect a higher risk score and follow-up steps in the activity list.',
    },
];

const SUCCESS_BLURB: Record<ScenarioKey, string> = {
    room_delay: 'Started. In a few seconds, scroll the “What ARIA did” list for kitchen, manager, and guest-message steps.',
    angry_tweet: 'Started. Check the activity list for reply drafting and recovery outreach.',
    occupancy_spike: 'Started. Give the pricing and revenue tiles a moment to refresh.',
    guest_churn: 'Started. Watch the activity list and the “Guest departure risk” area after a short wait.',
};

export function DemoScenariosPanel() {
    const { csrfToken, demoTriggersEnabled } = usePage().props;
    const [busy, setBusy] = useState<ScenarioKey | null>(null);
    const [lastJson, setLastJson] = useState<string | null>(null);
    const [lastError, setLastError] = useState<string | null>(null);
    const [lastOkScenario, setLastOkScenario] = useState<ScenarioKey | null>(null);

    const run = useCallback(
        async (scenario: ScenarioKey) => {
            setBusy(scenario);
            setLastError(null);
            setLastJson(null);
            setLastOkScenario(null);

            try {
                const res = await fetch(trigger.scenario.url(), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify({ scenario }),
                });

                const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

                if (!res.ok) {
                    if (res.status === 404) {
                        setLastError(
                            'Practice runs are turned off. Ask your technical contact to enable demo mode in settings.',
                        );
                    } else {
                        setLastError(
                            typeof data.error === 'string'
                                ? data.error
                                : 'Something went wrong. Try again or ask for help.',
                        );
                    }

                    return;
                }

                if (data.ok === true && typeof data.scenario === 'string' && data.scenario in SUCCESS_BLURB) {
                    setLastOkScenario(data.scenario as ScenarioKey);
                }

                setLastJson(JSON.stringify(data, null, 2));
            } catch (e) {
                setLastError(e instanceof Error ? e.message : 'Could not reach the server.');
            } finally {
                setBusy(null);
            }
        },
        [csrfToken],
    );

    if (!demoTriggersEnabled) {
        return (
            <section className="overflow-hidden rounded-lg border border-border/60 bg-muted/20">
                <div className="border-b border-border/50 px-3 py-2">
                    <p className="text-foreground text-sm font-medium">Practice scenarios</p>
                    <p className="text-muted-foreground text-xs">Try sample situations for tours or training.</p>
                </div>
                <div className="text-muted-foreground space-y-2 p-4 text-sm leading-relaxed">
                    <p>This is turned off right now. Your technical contact can switch it on in the project settings.</p>
                    <p className="text-xs">They will know terms like “demo triggers” and “environment file.”</p>
                </div>
            </section>
        );
    }

    return (
        <section className="overflow-hidden rounded-lg border border-border/60 bg-muted/20">
            <div className="border-b border-border/50 px-3 py-2">
                <p className="text-foreground text-sm font-medium">Practice scenarios</p>
                <p className="text-muted-foreground text-xs">
                    Tap <span className="text-foreground font-medium">Run</span>, then watch{' '}
                    <span className="text-foreground font-medium">What ARIA did</span> below. No setup on your side.
                </p>
            </div>
            <div className="grid gap-2 p-3 sm:grid-cols-2">
                {SCENARIOS.map((s, idx) => (
                    <div
                        key={s.id}
                        className="aria-animate-in border-border/50 rounded-md border bg-card/25 p-3"
                        style={{ animationDelay: `${80 + idx * 70}ms` }}
                    >
                        <p className="text-sm font-medium">{s.title}</p>
                        <p className="text-muted-foreground mt-1 text-xs leading-snug">{s.plain}</p>
                        <p className="text-muted-foreground mt-2 border-border/40 border-t pt-2 text-[11px] leading-snug">
                            <span className="text-foreground/90 font-medium">What to look for:</span> {s.outcome}
                        </p>
                        <div className="mt-3 flex justify-end">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1.5 rounded-md border-border/70 px-3 text-xs"
                                disabled={busy !== null}
                                onClick={() => run(s.id)}
                            >
                                {busy === s.id ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                    <Play className="size-3.5" />
                                )}
                                Run sample
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="border-border/50 border-t px-3 py-2">
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                    <span className="text-foreground font-medium">Phone demo:</span> voice features are optional; WhatsApp
                    and this screen are enough for most walkthroughs.
                </p>
            </div>
            {lastOkScenario ? (
                <div className="border-border/50 border-t bg-emerald-500/[0.08] px-3 py-2 dark:bg-emerald-500/10">
                    <p className="text-emerald-900 text-sm font-medium dark:text-emerald-100/95">Started successfully</p>
                    <p className="text-emerald-900/85 mt-0.5 text-xs leading-relaxed dark:text-emerald-100/80">
                        {SUCCESS_BLURB[lastOkScenario]}
                    </p>
                </div>
            ) : null}
            {lastError ? (
                <div className="border-border/50 text-destructive border-t px-3 py-2 text-sm">{lastError}</div>
            ) : null}
            {lastJson ? (
                <details className="border-border/50 border-t">
                    <summary className="text-muted-foreground hover:text-foreground flex cursor-pointer list-none items-center gap-1 px-3 py-2 text-xs font-medium [&::-webkit-details-marker]:hidden">
                        <ChevronDown className="size-3.5 shrink-0" />
                        Technical response (for developers)
                    </summary>
                    <pre
                        className={cn(
                            'max-h-32 overflow-auto border-border/40 border-t p-3 font-mono text-[10px] leading-relaxed',
                            'text-muted-foreground',
                        )}
                    >
                        {lastJson}
                    </pre>
                </details>
            ) : null}
        </section>
    );
}
