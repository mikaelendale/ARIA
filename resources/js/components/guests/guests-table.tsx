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
import { ChurnScoreBar } from '@/components/dashboard/churn-score-bar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatRelativeTime, formatTimeAgo } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { Guest } from '@/types/ops';
import { show as guestShow } from '@/routes/guests';

export function GuestsTable({ data }: { data: Guest[] }) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [nameFilter, setNameFilter] = useState('');

    const columns = useMemo<ColumnDef<Guest>[]>(
        () => [
            {
                accessorKey: 'name',
                header: 'Name',
                cell: ({ row }) => (
                    <Link
                        href={guestShow.url(row.original.id)}
                        className="text-primary font-medium hover:underline"
                    >
                        {row.original.name}
                    </Link>
                ),
            },
            { accessorKey: 'room', header: 'Room' },
            {
                accessorKey: 'churnScore',
                header: 'Leave risk',
                cell: ({ row }) => <ChurnScoreBar score={row.original.churnScore} className="max-w-[200px]" />,
            },
            {
                accessorKey: 'vip',
                header: 'VIP',
                cell: ({ row }) => (
                    <Badge variant={row.original.vip ? 'default' : 'secondary'}>
                        {row.original.vip ? 'VIP' : 'Standard'}
                    </Badge>
                ),
            },
            {
                accessorKey: 'lastInteraction',
                header: 'Last interaction',
                cell: ({ row }) => (
                    <span className="text-muted-foreground text-xs tabular-nums" title={formatRelativeTime(row.original.lastInteraction)}>
                        {formatTimeAgo(row.original.lastInteraction)}
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
            globalFilter: nameFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setNameFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="space-y-3">
            <Input
                placeholder="Search by guest name…"
                value={nameFilter}
                onChange={(event) => setNameFilter(event.target.value)}
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
                            <TableRow
                                key={row.id}
                                className={cn(
                                    'transition-colors',
                                    'hover:bg-muted/50 data-[state=selected]:bg-muted/50',
                                )}
                            >
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
