import { Head, usePage } from '@inertiajs/react';
import { IncidentsTable } from '@/components/incidents/incidents-table';
import { useIncidents } from '@/hooks/useOpsQueries';
import AppLayout from '@/layouts/app-layout';
import type { Incident } from '@/types/ops';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Overview', href: '/dashboard' },
    { title: 'Issues', href: '/incidents' },
];

export default function IncidentsPage() {
    const { incidents: initialIncidents } = usePage<{ incidents: Incident[] }>().props;
    const incidentsQuery = useIncidents(initialIncidents);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Issues — Kuriftu" />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6 px-4 py-4 md:px-6 md:py-5">
                <div className="space-y-1">
                    <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">Issues</p>
                    <h1 className="text-2xl font-semibold tracking-tight">Cases we are tracking</h1>
                    <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
                        Open items need attention. Severity tells you how urgent it is. Open a row to see what the system
                        already did and when it was closed, if applicable.
                    </p>
                </div>
                <IncidentsTable data={incidentsQuery.data ?? []} />
            </div>
        </AppLayout>
    );
}
