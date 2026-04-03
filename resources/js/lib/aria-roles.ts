export type AriaRole = 'gm' | 'operations' | 'manager' | 'reception' | 'viewer' | string;

export const ARIA_ROLE_LABELS: Record<string, string> = {
    gm: 'General Manager',
    operations: 'Operations',
    manager: 'Department Manager',
    reception: 'Reception',
    viewer: 'Viewer',
};

export function roleLabel(role: string | undefined): string {
    if (!role) {
        return 'Team';
    }

    return ARIA_ROLE_LABELS[role] ?? role;
}

export type DashboardVisibility = {
    showLiveFeed: boolean;
    showSignalsColumn: boolean;
    showPulseRevenue: boolean;
    showAgents: boolean;
    showChurn: boolean;
    showQuickLinks: boolean;
    showDemoPanel: boolean;
    heroVariant: 'command' | 'operations' | 'floor' | 'read-only';
};

export function dashboardVisibilityForRole(role: string | undefined): DashboardVisibility {
    switch (role) {
        case 'gm':
            return {
                showLiveFeed: true,
                showSignalsColumn: true,
                showPulseRevenue: true,
                showAgents: true,
                showChurn: true,
                showQuickLinks: true,
                showDemoPanel: true,
                heroVariant: 'command',
            };
        case 'operations':
            return {
                showLiveFeed: true,
                showSignalsColumn: true,
                showPulseRevenue: true,
                showAgents: true,
                showChurn: true,
                showQuickLinks: true,
                showDemoPanel: true,
                heroVariant: 'operations',
            };
        case 'manager':
            return {
                showLiveFeed: true,
                showSignalsColumn: true,
                showPulseRevenue: false,
                showAgents: true,
                showChurn: true,
                showQuickLinks: true,
                showDemoPanel: true,
                heroVariant: 'floor',
            };
        case 'reception':
            return {
                showLiveFeed: true,
                showSignalsColumn: true,
                showPulseRevenue: false,
                showAgents: false,
                showChurn: true,
                showQuickLinks: true,
                showDemoPanel: false,
                heroVariant: 'floor',
            };
        case 'viewer':
        default:
            return {
                showLiveFeed: false,
                showSignalsColumn: false,
                showPulseRevenue: false,
                showAgents: false,
                showChurn: true,
                showQuickLinks: true,
                showDemoPanel: false,
                heroVariant: 'read-only',
            };
    }
}
