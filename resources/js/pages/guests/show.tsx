import { Head, Link, usePage } from '@inertiajs/react';
import { ChurnScoreBar } from '@/components/dashboard/churn-score-bar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formatCurrencyETB, formatRelativeTime, formatTimeAgo } from '@/lib/formatters';
import { friendlyAgentName } from '@/lib/aria-agent-copy';
import AppLayout from '@/layouts/app-layout';
import type { GuestDetail } from '@/types/ops';
import { show as incidentShow } from '@/routes/incidents';
import { index as guestsIndex } from '@/routes/guests';
import { ChevronDown } from 'lucide-react';

function SectionCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <Card className="rounded-xl border-muted p-0 shadow-sm lg:p-4">
            <Collapsible defaultOpen className="group/coll space-y-0">
                <CollapsibleTrigger className="text-muted-foreground hover:text-foreground flex w-full items-center justify-between px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider lg:hidden">
                    <span>{title}</span>
                    <ChevronDown className="size-4 transition-transform group-data-[state=open]/coll:rotate-180" />
                </CollapsibleTrigger>
                <h2 className="text-muted-foreground hidden px-4 pt-4 text-xs font-semibold uppercase tracking-wider lg:block lg:px-0 lg:pt-0">
                    {title}
                </h2>
                <CollapsibleContent className="max-lg:data-[state=closed]:hidden lg:block">
                    <div className="px-4 pb-4 lg:px-0 lg:pb-0">{children}</div>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}

export default function GuestShow() {
    const { guest } = usePage<{ guest: GuestDetail }>().props;
    const tags = guest.preferenceTags ?? [];

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Overview', href: '/dashboard' },
                { title: 'Guests', href: guestsIndex.url() },
                { title: guest.name, href: `/guests/${guest.id}` },
            ]}
        >
            <Head title={`${guest.name} — Guest`} />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col px-4 py-4 md:px-6 md:py-5">
                <div className="mx-auto w-full max-w-5xl space-y-4">
                <div className="grid gap-4 lg:grid-cols-2">
                    <Card className="rounded-xl border-muted p-4 shadow-sm">
                        <h2 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wider">
                            Guest details
                        </h2>
                        <div className="space-y-2 text-sm">
                            <div className="text-lg font-semibold tracking-tight">{guest.name}</div>
                            <div className="text-muted-foreground">Room {guest.room || '—'}</div>
                            {guest.phone ? <div className="text-muted-foreground">{guest.phone}</div> : null}
                            {guest.email ? <div className="text-muted-foreground">{guest.email}</div> : null}
                        </div>
                    </Card>
                    <Card className="rounded-xl border-muted p-4 shadow-sm">
                        <h2 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wider">
                            Risk & preferences
                        </h2>
                        <p className="text-muted-foreground mb-2 text-xs leading-relaxed">
                            Risk is an estimate of how likely this guest is to leave unhappy. Preferences help staff
                            personalize service.
                        </p>
                        <div className="space-y-3">
                            <ChurnScoreBar score={guest.churnScore} label="Leave risk" />
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant={guest.vip ? 'default' : 'secondary'}>{guest.vip ? 'VIP' : 'Standard'}</Badge>
                                {tags.length === 0 ? (
                                    <span className="text-muted-foreground text-xs">No preference tags</span>
                                ) : (
                                    tags.map((tag) => (
                                        <Badge key={tag} variant="outline" className="rounded-md font-normal">
                                            {tag}
                                        </Badge>
                                    ))
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                <SectionCard title="Bookings">
                    <ul className="space-y-2 text-sm">
                        {guest.bookings.length === 0 ? (
                            <li className="text-muted-foreground">No bookings</li>
                        ) : (
                            guest.bookings.map((b) => (
                                <li
                                    key={b.id}
                                    className="border-muted rounded-lg border bg-background/40 p-3 transition-colors hover:bg-muted/30"
                                >
                                    <div className="font-medium">
                                        {b.room_type} — {b.status}
                                    </div>
                                    <div className="text-muted-foreground text-xs tabular-nums">
                                        {b.check_in_date ?? '—'} → {b.check_out_date ?? '—'}
                                    </div>
                                    <div className="text-muted-foreground mt-1 text-xs">
                                        {formatCurrencyETB(Number.parseFloat(b.total_amount) || 0)}
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </SectionCard>

                <SectionCard title="Related issues">
                    <ul className="space-y-2 text-sm">
                        {guest.incidents.length === 0 ? (
                            <li className="text-muted-foreground">No linked issues</li>
                        ) : (
                            guest.incidents.map((i) => (
                                <li key={i.id}>
                                    <Link
                                        href={incidentShow.url(i.id)}
                                        className="border-muted block rounded-lg border bg-background/40 p-3 transition-all hover:border-muted-foreground/30 hover:bg-muted/30"
                                    >
                                        <div className="font-medium">
                                            {i.type}{' '}
                                            <span className="text-muted-foreground font-normal">
                                                ({i.severity}) — {i.status}
                                            </span>
                                        </div>
                                        {i.description ? (
                                            <div className="text-muted-foreground mt-1 text-xs">{i.description}</div>
                                        ) : null}
                                    </Link>
                                </li>
                            ))
                        )}
                    </ul>
                </SectionCard>

                <SectionCard title="What the system did for this guest">
                    {guest.agentActions.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No steps recorded yet.</p>
                    ) : (
                        <ul className="relative ms-3 space-y-6 border-s border-muted pb-1 ps-6">
                            {guest.agentActions.map((a) => (
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
                                        <Badge variant="outline" className="ml-2 align-middle text-[10px]">
                                            {a.status}
                                        </Badge>
                                    </div>
                                    <p className="mt-1 text-sm">{a.message}</p>
                                    {a.revenueImpact !== 0 ? (
                                        <p className="text-muted-foreground mt-1 text-xs tabular-nums">
                                            {formatCurrencyETB(a.revenueImpact)}
                                        </p>
                                    ) : null}
                                </li>
                            ))}
                        </ul>
                    )}
                </SectionCard>
                </div>
            </div>
        </AppLayout>
    );
}
