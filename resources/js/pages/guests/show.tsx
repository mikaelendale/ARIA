import { Head } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useGuestDetail } from '@/hooks/useOpsQueries';
import AppLayout from '@/layouts/app-layout';

export default function GuestShow({ guestId }: { guestId: number }) {
    const guestQuery = useGuestDetail(guestId);
    const guest = guestQuery.data;

    return (
        <AppLayout breadcrumbs={[{ title: 'Guests', href: '/guests' }, { title: 'Detail', href: `/guests/${guestId}` }]}>
            <Head title="Guest Detail" />
            <div className="grid gap-4 p-4 lg:grid-cols-2">
                <Card className="rounded-xl p-4">
                    <h2 className="mb-2 text-sm font-semibold">Profile</h2>
                    <div className="space-y-1 text-sm">
                        <div>{guest?.name ?? 'Unknown guest'}</div>
                        <div className="text-muted-foreground">Room {guest?.room ?? '-'}</div>
                    </div>
                </Card>
                <Card className="rounded-xl p-4">
                    <h2 className="mb-2 text-sm font-semibold">Churn + Tags</h2>
                    <div className="space-y-2">
                        <div className="text-sm">Churn Score: {guest?.churnScore ?? 0}%</div>
                        <Badge variant={guest?.vip ? 'default' : 'secondary'}>{guest?.vip ? 'VIP' : 'Standard'}</Badge>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
