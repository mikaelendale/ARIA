/** Plain-language labels for non-technical users (technical id → UI copy). */

export function friendlyAgentName(technical: string): string {
    const map: Record<string, string> = {
        orchestrator: 'Head assistant',
        nexus: 'Operations & staff',
        pulse: 'Pricing & offers',
        vera: 'Guest loyalty',
        echo: 'Reviews & social',
        hermes: 'Voice line',
        sentinel: 'Monitoring',
    };

    return map[technical] ?? technical;
}

/** Short filter chip text */
export function friendlyAgentFilterShort(technical: string): string {
    const map: Record<string, string> = {
        all: 'All',
        orchestrator: 'Head',
        nexus: 'Ops',
        pulse: 'Pricing',
        vera: 'Loyalty',
        echo: 'Social',
        hermes: 'Voice',
        sentinel: 'Watch',
    };

    return map[technical] ?? technical;
}
