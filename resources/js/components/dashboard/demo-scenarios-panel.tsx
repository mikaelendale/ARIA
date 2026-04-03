import { usePage } from '@inertiajs/react';
import { Loader2, Play } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import trigger from '@/routes/api/trigger';

type ScenarioKey = 'room_delay' | 'angry_tweet' | 'occupancy_spike' | 'guest_churn';

const SCENARIOS: {
    id: ScenarioKey;
    label: string;
    detail: string;
}[] = [
    {
        id: 'room_delay',
        label: '1 · Room service delay',
        detail: 'Creates a 40m pending order, runs Sentinel → orchestrator (kitchen / manager / WhatsApp).',
    },
    {
        id: 'angry_tweet',
        label: '2 · Social recovery',
        detail: 'Synthetic negative mention → draft_reply + recovery WhatsApp path.',
    },
    {
        id: 'occupancy_spike',
        label: '3 · Occupancy + Pulse',
        detail: 'Marks rooms occupied, queues Pulse for pricing / promo + live counter.',
    },
    {
        id: 'guest_churn',
        label: '4 · Churn risk',
        detail: 'Staged complaint + Vera job → high churn event and recovery tools.',
    },
];

export function DemoScenariosPanel() {
    const { csrfToken, demoTriggersEnabled } = usePage().props;
    const [busy, setBusy] = useState<ScenarioKey | null>(null);
    const [lastJson, setLastJson] = useState<string | null>(null);
    const [lastError, setLastError] = useState<string | null>(null);

    const run = useCallback(
        async (scenario: ScenarioKey) => {
            setBusy(scenario);
            setLastError(null);
            setLastJson(null);

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

                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    setLastError(
                        typeof data.error === 'string'
                            ? data.error
                            : res.status === 404
                              ? 'Demo API off — set ARIA_DEMO_TRIGGERS=true in .env'
                              : `HTTP ${res.status}`,
                    );

                    return;
                }

                setLastJson(JSON.stringify(data, null, 2));
            } catch (e) {
                setLastError(e instanceof Error ? e.message : 'Request failed');
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
                    <p className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
                        Demo scenarios
                    </p>
                </div>
                <div className="text-muted-foreground p-4 text-sm leading-relaxed">
                    Enable hackathon triggers with{' '}
                    <code className="text-foreground bg-muted/60 rounded px-1 py-0.5 text-xs">
                        ARIA_DEMO_TRIGGERS=true
                    </code>{' '}
                    in <code className="text-foreground bg-muted/60 rounded px-1 py-0.5 text-xs">.env</code>, then
                    run queue workers (<code className="text-xs">aria-core</code>,{' '}
                    <code className="text-xs">aria-sentinel</code>, <code className="text-xs">aria-vera</code>,{' '}
                    <code className="text-xs">aria-pulse</code>) and Reverb for the feed.
                </div>
            </section>
        );
    }

    return (
        <section className="overflow-hidden rounded-lg border border-border/60 bg-muted/20">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 px-3 py-2">
                <p className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
                    Demo scenarios
                </p>
                <span className="text-muted-foreground text-xs">Phase 11 · one tap each</span>
            </div>
            <div className="grid gap-2 p-3 sm:grid-cols-2">
                {SCENARIOS.map((s, idx) => (
                    <div
                        key={s.id}
                        className="aria-animate-in border-border/50 rounded-md border bg-card/25 p-2.5"
                        style={{ animationDelay: `${80 + idx * 70}ms` }}
                    >
                        <div className="mb-2 flex items-start justify-between gap-2">
                            <div>
                                <p className="text-sm font-medium">{s.label}</p>
                                <p className="text-muted-foreground mt-0.5 text-xs leading-snug">{s.detail}</p>
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-8 shrink-0 gap-1 rounded-md border-border/70 px-2 text-xs"
                                disabled={busy !== null}
                                onClick={() => run(s.id)}
                            >
                                {busy === s.id ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                    <Play className="size-3.5" />
                                )}
                                Run
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="border-border/50 border-t px-3 py-2">
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                    <span className="text-foreground font-medium">5 · Voice (Hermes):</span> deferred — use WhatsApp
                    inbound for live guest demo. For stage, run scenarios 1–4 in order (~3 min) with workers + scheduler
                    already running.
                </p>
            </div>
            {lastError ? (
                <div className="border-border/50 text-destructive border-t px-3 py-2 text-xs">{lastError}</div>
            ) : null}
            {lastJson ? (
                <pre
                    className={cn(
                        'border-border/50 max-h-36 overflow-auto border-t p-3 font-mono text-[11px] leading-relaxed',
                        'text-muted-foreground',
                    )}
                >
                    {lastJson}
                </pre>
            ) : null}
        </section>
    );
}
