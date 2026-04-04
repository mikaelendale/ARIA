import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatRelativeTime, formatTimeAgo } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { Incident } from '@/types/ops';
import { show as incidentShow } from '@/routes/incidents';

function severityBadgeVariant(severity: Incident['severity']): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (severity === 'critical' || severity === 'high') {
        return 'destructive';
    }

    if (severity === 'medium') {
        return 'default';
    }

    return 'secondary';
}

function statusBadgeVariant(status: Incident['status']): 'default' | 'secondary' | 'outline' {
    if (status === 'open') {
        return 'default';
    }

    if (status === 'triaged') {
        return 'secondary';
    }

    return 'outline';
}

export function IncidentsTable({ data }: { data: Incident[] }) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [typeFilter, setTypeFilter] = useState('');

    const columns = useMemo<ColumnDef<Incident>[]>(
        () => [
            {
                accessorKey: 'type',
                header: 'Topic',
                cell: ({ row }) => (
                    <Link
                        href={incidentShow.url(row.original.id)}
                        className="text-primary font-medium hover:underline"
                    >
                        {row.original.type}
                    </Link>
                ),
            },
            {
                accessorKey: 'severity',
                header: 'Urgency',
                cell: ({ row }) => (
                    <Badge
                        variant={severityBadgeVariant(row.original.severity)}
                        className="rounded-md text-[10px] uppercase tracking-wide"
                    >
                        {row.original.severity}
                    </Badge>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => (
                    <Badge variant={statusBadgeVariant(row.original.status)} className="rounded-md capitalize">
                        {row.original.status}
                    </Badge>
                ),
            },
            { accessorKey: 'resolutionTime', header: 'Time to close' },
            {
                accessorKey: 'createdAt',
                header: 'Opened',
                cell: ({ row }) => (
                    <span className="text-muted-foreground text-xs tabular-nums" title={formatRelativeTime(row.original.createdAt)}>
                        {formatTimeAgo(row.original.createdAt)}
                    </span>
                ),
            },
        ],
        [],
    );

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            globalFilter: typeFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setTypeFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="space-y-3">
            <Input
                placeholder="Search by topic or keyword…"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="max-w-sm"
            />
            <div className="rounded-xl border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id} className={cn('transition-colors hover:bg-muted/50')}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
