import type { Auth } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            csrfToken: string;
            demoTriggersEnabled: boolean;
            [key: string]: unknown;
        };
    }
}
