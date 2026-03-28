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
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Guest } from '@/types/ops';

export function GuestsTable({ data }: { data: Guest[] }) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [nameFilter, setNameFilter] = useState('');

    const columns = useMemo<ColumnDef<Guest>[]>(
        () => [
            { accessorKey: 'name', header: 'Name' },
            { accessorKey: 'room', header: 'Room' },
            {
                accessorKey: 'churnScore',
                header: 'Churn Score',
                cell: ({ row }) => {
                    const score = row.original.churnScore;
                    const color = score <= 40 ? 'bg-green-500' : score <= 70 ? 'bg-amber-500' : 'bg-red-500';

                    return (
                        <div className="w-40">
                            <Progress value={score} indicatorClassName={color} />
                        </div>
                    );
                },
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
            { accessorKey: 'lastInteraction', header: 'Last Interaction' },
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
                placeholder="Filter guests by name..."
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
