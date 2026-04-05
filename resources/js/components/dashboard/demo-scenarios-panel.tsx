import { usePage } from '@inertiajs/react';
import { ChevronDown, FlaskConical, Loader2, Play } from 'lucide-react';
import { useCallback, useState  } from 'react';
import type {ReactNode} from 'react';
import { Button } from '@/components/ui/button';
import { runDemoScenarioWithToast  } from '@/lib/demo-scenario-trigger';
import type {DemoScenarioKey} from '@/lib/demo-scenario-trigger';
import { cn } from '@/lib/utils';

const SCENARIOS: {
    id: DemoScenarioKey;
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
        outcome: 'Pricing and “extra revenue today” style numbers may move in the status column.',
    },
    {
        id: 'guest_churn',
        title: 'Guest may leave unhappy',
        plain: 'Adds context so the loyalty helper raises the risk score.',
        outcome: 'Expect a higher risk score and follow-up steps in the activity list.',
    },
];

function PanelHeader({ subtitle }: { subtitle: ReactNode }) {
    return (
        <div className="border-border flex items-start gap-2 border-b px-3 py-2.5 sm:px-4">
            <FlaskConical className="text-muted-foreground mt-0.5 size-4 shrink-0 stroke-[1.75]" aria-hidden />
            <div className="min-w-0">
                <p className="text-foreground text-sm font-semibold">Practice scenarios</p>
                {subtitle}
            </div>
        </div>
    );
}

export function DemoScenariosPanel() {
    const { csrfToken, demoTriggersEnabled } = usePage().props;
    const [busy, setBusy] = useState<DemoScenarioKey | null>(null);
    const [lastJson, setLastJson] = useState<string | null>(null);

    const run = useCallback(
        async (scenario: DemoScenarioKey) => {
            const meta = SCENARIOS.find((s) => s.id === scenario);
            const title = meta?.title ?? scenario;

            setBusy(scenario);
            setLastJson(null);

            try {
                const result = await runDemoScenarioWithToast(scenario, csrfToken ?? '', title);
                setLastJson(result.rawJson);
            } catch {
                /* Outcome already shown via toast */
            } finally {
                setBusy(null);
            }
        },
        [csrfToken],
    );

    if (!demoTriggersEnabled) {
        return (
            <section className="border-border bg-card overflow-hidden border shadow-none">
                <PanelHeader
                    subtitle={
                        <p className="text-muted-foreground mt-0.5 text-xs leading-snug">
                            Try sample situations for tours or training. This is turned off — your technical contact can
                            enable demo triggers in settings.
                        </p>
                    }
                />
                <div className="text-muted-foreground space-y-2 px-3 py-4 text-sm leading-relaxed sm:px-4">
                    <p>They will know terms like “demo triggers” and “environment file.”</p>
                </div>
            </section>
        );
    }

    return (
        <section className="border-border bg-card overflow-hidden border shadow-none">
            <PanelHeader
                subtitle={
                    <p className="text-muted-foreground mt-0.5 text-xs leading-snug">
                        Run a sample, then watch <span className="text-foreground font-medium">What ARIA did</span> below.
                        Safe for training — no real guest impact. Watch the top bar while a run is in progress; a toast
                        confirms when it finishes.
                    </p>
                }
            />
            <div className="grid gap-2 p-3 sm:p-4">
                {SCENARIOS.map((s) => (
                    <div key={s.id} className="border-border bg-muted/20 space-y-2 border p-3">
                        <div>
                            <p className="text-foreground text-sm font-medium">{s.title}</p>
                            <p className="text-muted-foreground mt-1 text-xs leading-snug">{s.plain}</p>
                        </div>
                        <p className="text-muted-foreground border-border border-t pt-2 text-[11px] leading-snug">
                            <span className="text-foreground font-medium">Look for:</span> {s.outcome}
                        </p>
                        <div className="flex justify-end pt-0.5">
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                className="h-8 gap-1.5 rounded-sm border border-border px-3 text-xs shadow-none"
                                disabled={busy !== null}
                                onClick={() => void run(s.id)}
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
            <div className="border-border border-t px-3 py-2 sm:px-4">
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                    <span className="text-foreground font-medium">Phone demo:</span> voice is optional; WhatsApp and this
                    screen are enough for most walkthroughs.
                </p>
            </div>
            {lastJson ? (
                <details className="border-border border-t">
                    <summary className="text-muted-foreground flex cursor-pointer list-none items-center gap-1 px-3 py-2 text-xs font-medium sm:px-4 [&::-webkit-details-marker]:hidden">
                        <ChevronDown className="size-3.5 shrink-0" />
                        Technical response (for developers)
                    </summary>
                    <pre
                        className={cn(
                            'max-h-32 overflow-auto border-border border-t p-3 font-mono text-[10px] leading-relaxed sm:px-4',
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
