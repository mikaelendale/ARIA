import { Head, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatRelativeTime, formatTimeAgo } from '@/lib/formatters';
import { friendlyAgentName } from '@/lib/aria-agent-copy';
import AppLayout from '@/layouts/app-layout';
import type { IncidentDetail } from '@/types/ops';
import { index as incidentsIndex } from '@/routes/incidents';

function severityVariant(s: IncidentDetail['severity']): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (s === 'critical' || s === 'high') {
        return 'destructive';
    }

    if (s === 'medium') {
        return 'default';
    }

    return 'secondary';
}

function statusVariant(s: IncidentDetail['status']): 'default' | 'secondary' | 'outline' {
    if (s === 'open') {
        return 'default';
    }

    if (s === 'triaged') {
        return 'secondary';
    }

    return 'outline';
}

export default function IncidentShow() {
    const { incident } = usePage<{ incident: IncidentDetail }>().props;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Overview', href: '/dashboard' },
                { title: 'Issues', href: incidentsIndex.url() },
                { title: incident.type, href: `/incidents/${incident.id}` },
            ]}
        >
            <Head title={`Issue — ${incident.type}`} />
            <div className="mx-auto max-w-3xl space-y-4 p-4">
                <Card className="rounded-xl border-muted p-4 shadow-sm">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold tracking-tight">{incident.type}</h2>
                        <Badge variant={severityVariant(incident.severity)} className="rounded-md text-[10px] uppercase">
                            {incident.severity}
                        </Badge>
                        <Badge variant={statusVariant(incident.status)} className="rounded-md capitalize">
                            {incident.status}
                        </Badge>
                    </div>
                    <dl className="text-muted-foreground grid gap-2 text-sm">
                        <div className="flex flex-wrap gap-x-2">
                            <dt className="font-medium text-foreground">Opened</dt>
                            <dd className="tabular-nums" title={formatRelativeTime(incident.createdAt)}>
                                {formatTimeAgo(incident.createdAt)} ({formatRelativeTime(incident.createdAt)})
                            </dd>
                        </div>
                        <div className="flex flex-wrap gap-x-2">
                            <dt className="font-medium text-foreground">Time to close</dt>
                            <dd>{incident.resolutionTime ?? '—'}</dd>
                        </div>
                    </dl>
                    {incident.description ? (
                        <p className="text-muted-foreground mt-4 border-t pt-4 text-sm leading-relaxed">{incident.description}</p>
                    ) : null}
                </Card>

                <Card className="rounded-xl border-muted p-4 shadow-sm">
                    <h3 className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wider">
                        What happened (step by step)
                    </h3>
                    <p className="text-muted-foreground mb-4 text-xs leading-relaxed">
                        Each line is something the system did while this issue was open.
                    </p>
                    {incident.agentActions.length === 0 ? (
                        <p className="text-muted-foreground text-sm">Nothing logged for this issue yet.</p>
                    ) : (
                        <ul className="relative ms-3 space-y-6 border-s border-muted pb-1 ps-6">
                            {incident.agentActions.map((a) => (
                                <li key={a.id} className="relative">
                                    <span
                                        className="bg-primary absolute top-1.5 -left-[29px] size-2.5 rounded-full ring-2 ring-background"
                                        aria-hidden
                                    />
                                    <div className="text-xs font-medium">
                                        {friendlyAgentName(a.agent)}{' '}
                                        <span className="text-muted-foreground font-normal font-mono text-[10px]">
                                            · {a.tool}
                                        </span>
                                    </div>
                                    <div className="text-muted-foreground mt-0.5 text-xs tabular-nums">
                                        {a.timestamp ? (
                                            <>
                                                {formatTimeAgo(a.timestamp)}
                                                <span className="text-muted-foreground/80 ml-1">
                                                    ({formatRelativeTime(a.timestamp)})
                                                </span>
                                            </>
                                        ) : (
                                            '—'
                                        )}
                                    </div>
                                    <p className="mt-1 text-sm">{a.message}</p>
                                    <Badge variant="outline" className="mt-2 text-[10px]">
                                        {a.status}
                                    </Badge>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
