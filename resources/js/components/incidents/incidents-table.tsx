import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable
    
    
} from '@tanstack/react-table';
import type {ColumnDef, SortingState} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Incident } from '@/types/ops';

export function IncidentsTable({ data }: { data: Incident[] }) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [typeFilter, setTypeFilter] = useState('');

    const columns = useMemo<ColumnDef<Incident>[]>(
        () => [
            { accessorKey: 'type', header: 'Type' },
            {
                accessorKey: 'severity',
                header: 'Severity',
                cell: ({ row }) => {
                    const severity = row.original.severity;
                    const variant = severity === 'critical' || severity === 'high' ? 'default' : 'secondary';

                    return <Badge variant={variant}>{severity}</Badge>;
                },
            },
            { accessorKey: 'status', header: 'Status' },
            { accessorKey: 'resolutionTime', header: 'Resolution Time' },
            { accessorKey: 'createdAt', header: 'Created At' },
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
                placeholder="Filter incidents by type..."
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
                            <TableRow key={row.id}>
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
