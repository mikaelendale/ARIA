import { Head, usePage } from '@inertiajs/react';
import { IncidentsTable } from '@/components/incidents/incidents-table';
import { useIncidents } from '@/hooks/useOpsQueries';
import AppLayout from '@/layouts/app-layout';
import type { Incident } from '@/types/ops';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Incidents', href: '/incidents' },
];

export default function IncidentsPage() {
    const { incidents: initialIncidents } = usePage<{ incidents: Incident[] }>().props;
    const incidentsQuery = useIncidents(initialIncidents);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Incidents" />
            <div className="space-y-6 py-6">
                <div className="space-y-1">
                    <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">Operations</p>
                    <h1 className="text-2xl font-semibold tracking-tight">Incidents</h1>
                    <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
                        Open cases, severity, and resolution trail from Sentinel, Echo, and staff channels.
                    </p>
                </div>
                <IncidentsTable data={incidentsQuery.data ?? []} />
            </div>
        </AppLayout>
    );
}
