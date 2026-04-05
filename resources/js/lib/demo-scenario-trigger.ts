import { toast } from 'sonner';

import { useDemoScenarioRunStore } from '@/app/store/useDemoScenarioRunStore';
import trigger from '@/routes/api/trigger';

export type DemoScenarioKey = 'room_delay' | 'angry_tweet' | 'occupancy_spike' | 'guest_churn';

const SUCCESS_BLURB: Record<DemoScenarioKey, string> = {
    room_delay:
        'In a few seconds, check “What ARIA did” for kitchen, manager, and guest-message steps.',
    angry_tweet: 'Check the activity list for reply drafting and recovery outreach.',
    occupancy_spike: 'Pricing and revenue tiles may update after a short wait.',
    guest_churn: 'Watch the activity list and guest departure risk after a short wait.',
};

export type DemoScenarioRunResult = {
    scenario: DemoScenarioKey;
    rawJson: string;
};

/**
 * POST demo scenario; throws with a user-facing message when the run cannot start.
 */
export async function executeDemoScenario(
    scenario: DemoScenarioKey,
    csrfToken: string,
): Promise<DemoScenarioRunResult> {
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
            throw new Error(
                'Practice runs are turned off. Ask your technical contact to enable demo mode in settings.',
            );
        }

        throw new Error(
            typeof data.error === 'string' ? data.error : 'Something went wrong. Try again or ask for help.',
        );
    }

    if (data.ok !== true || typeof data.scenario !== 'string' || !(data.scenario in SUCCESS_BLURB)) {
        throw new Error('Unexpected response from server.');
    }

    const key = data.scenario as DemoScenarioKey;

    return {
        scenario: key,
        rawJson: JSON.stringify(data, null, 2),
    };
}

/**
 * Runs a demo scenario: top progress bar while in flight, success toast when finished, error toast on failure.
 */
export async function runDemoScenarioWithToast(
    scenario: DemoScenarioKey,
    csrfToken: string,
    scenarioTitle: string,
): Promise<DemoScenarioRunResult> {
    const { setRunningTitle } = useDemoScenarioRunStore.getState();
    setRunningTitle(scenarioTitle);

    try {
        const result = await executeDemoScenario(scenario, csrfToken);
        toast.success('Scenario finished', {
            description: SUCCESS_BLURB[result.scenario],
        });

        return result;
    } catch (e) {
        toast.error('Practice run failed', {
            description: e instanceof Error ? e.message : 'Could not reach the server.',
        });

        throw e;
    } finally {
        setRunningTitle(null);
    }
}
