import { Head } from '@inertiajs/react';
import { IncidentsTable } from '@/components/incidents/incidents-table';
import { useIncidents } from '@/hooks/useOpsQueries';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Incidents', href: '/incidents' },
];

export default function IncidentsPage() {
    const incidentsQuery = useIncidents();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Incidents" />
            <div className="space-y-4 p-4">
                <div>
                    <h1 className="text-lg font-semibold">Incidents</h1>
                    <p className="text-muted-foreground text-sm">Event streams, status, and resolution timings.</p>
                </div>
                <IncidentsTable data={incidentsQuery.data ?? []} />
            </div>
        </AppLayout>
    );
}
