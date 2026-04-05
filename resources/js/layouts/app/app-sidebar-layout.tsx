import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent
                variant="sidebar"
                className="flex min-h-0 flex-1 flex-col overflow-hidden overflow-x-hidden md:!rounded-sm md:!shadow-none"
            >
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain">
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}
