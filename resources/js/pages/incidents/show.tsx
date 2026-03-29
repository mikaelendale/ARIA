import { Head } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { useIncidentDetail } from '@/hooks/useOpsQueries';
import AppLayout from '@/layouts/app-layout';

export default function IncidentShow({ incidentId }: { incidentId: number }) {
    const incidentQuery = useIncidentDetail(incidentId);
    const incident = incidentQuery.data;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Incidents', href: '/incidents' },
                { title: 'Detail', href: `/incidents/${incidentId}` },
            ]}
        >
            <Head title="Incident Detail" />
            <div className="grid gap-4 p-4">
                <Card className="rounded-xl p-4">
                    <h2 className="mb-3 text-sm font-semibold">Incident Timeline</h2>
                    <div className="space-y-1 text-sm">
                        <div>Type: {incident?.type ?? '-'}</div>
                        <div>Status: {incident?.status ?? '-'}</div>
                        <div>Created At: {incident?.createdAt ?? '-'}</div>
                        <div>Resolution Time: {incident?.resolutionTime ?? '-'}</div>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
