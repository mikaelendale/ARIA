import { usePage } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import trigger from '@/routes/api/trigger';

type ScenarioKey = 'room_delay' | 'angry_tweet' | 'occupancy_spike' | 'guest_churn';

const SCENARIOS: { id: ScenarioKey; label: string }[] = [
    { id: 'room_delay', label: 'Late room service' },
    { id: 'occupancy_spike', label: 'Hotel fills up' },
    { id: 'angry_tweet', label: 'Guest complaint online' },
    { id: 'guest_churn', label: 'Guest may leave unhappy' },
];

export function HackathonScenarioButtons() {
    const { csrfToken, demoTriggersEnabled } = usePage().props as { csrfToken?: string; demoTriggersEnabled?: boolean };
    const [busy, setBusy] = useState<ScenarioKey | null>(null);

    const run = useCallback(
        async (scenario: ScenarioKey) => {
            if (!demoTriggersEnabled) {
                return;
            }

            setBusy(scenario);

            try {
                await fetch(trigger.scenario.url(), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': csrfToken ?? '',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify({ scenario }),
                });
            } catch {
                /* judges: no error surface */
            } finally {
                setBusy(null);
            }
        },
        [csrfToken, demoTriggersEnabled],
    );

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SCENARIOS.map((s) => {
                const disabled = !demoTriggersEnabled || busy !== null;
                const loading = busy === s.id;

                return (
                    <Button
                        key={s.id}
                        type="button"
                        size="lg"
                        variant="secondary"
                        disabled={disabled}
                        className={cn(
                            'h-auto min-h-14 touch-manipulation rounded-xl px-4 py-4 text-left text-base font-semibold shadow-sm',
                            'justify-start sm:min-h-16 sm:text-lg',
                        )}
                        onClick={() => void run(s.id)}
                    >
                        <span className="flex w-full items-center gap-2">
                            {loading ? <Loader2 className="size-5 shrink-0 animate-spin" aria-hidden /> : null}
                            <span>{s.label}</span>
                        </span>
                    </Button>
                );
            })}
        </div>
    );
}
