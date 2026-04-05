import { Head, usePage } from '@inertiajs/react';
import { GuestsTable } from '@/components/guests/guests-table';
import { useGuests } from '@/hooks/useOpsQueries';
import AppLayout from '@/layouts/app-layout';
import type { Guest } from '@/types/ops';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Overview', href: '/dashboard' },
    { title: 'Guests', href: '/guests' },
];

export default function GuestsPage() {
    const { guests: initialGuests } = usePage<{ guests: Guest[] }>().props;
    const guestsQuery = useGuests(initialGuests);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Guests" />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6 px-4 py-4 md:px-6 md:py-5">
                <div className="space-y-1">
                    <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">Guest list</p>
                    <h1 className="text-2xl font-semibold tracking-tight">Who is with us</h1>
                    <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
                        Each row shows room, whether they are a VIP, how “at risk” of a bad departure we estimate them to
                        be, and when we last heard from them. Click a name for the full story.
                    </p>
                </div>
                <GuestsTable data={guestsQuery.data ?? []} />
            </div>
        </AppLayout>
    );
}
