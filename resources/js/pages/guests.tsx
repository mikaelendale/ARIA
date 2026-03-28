import { Head } from '@inertiajs/react';
import { GuestsTable } from '@/components/guests/guests-table';
import { useGuests } from '@/hooks/useOpsQueries';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Guests', href: '/guests' },
];

export default function GuestsPage() {
    const guestsQuery = useGuests();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Guests" />
            <div className="space-y-4 p-4">
                <div>
                    <h1 className="text-lg font-semibold">Guests</h1>
                    <p className="text-muted-foreground text-sm">Live churn and engagement overview.</p>
                </div>
                <GuestsTable data={guestsQuery.data ?? []} />
            </div>
        </AppLayout>
    );
}
