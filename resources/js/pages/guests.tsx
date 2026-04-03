import { Head, usePage } from '@inertiajs/react';
import { GuestsTable } from '@/components/guests/guests-table';
import { useGuests } from '@/hooks/useOpsQueries';
import AppLayout from '@/layouts/app-layout';
import type { Guest } from '@/types/ops';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Guests', href: '/guests' },
];

export default function GuestsPage() {
    const { guests: initialGuests } = usePage<{ guests: Guest[] }>().props;
    const guestsQuery = useGuests(initialGuests);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Guests" />
            <div className="space-y-6 py-6">
                <div className="space-y-1">
                    <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">Directory</p>
                    <h1 className="text-2xl font-semibold tracking-tight">Guests</h1>
                    <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
                        Churn risk, VIP flags, and last interaction — aligned with ARIA guest intelligence.
                    </p>
                </div>
                <GuestsTable data={guestsQuery.data ?? []} />
            </div>
        </AppLayout>
    );
}
