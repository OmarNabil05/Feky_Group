"use client"

import React from 'react'
import { ColumnDef, createColumnHelper, RowData, useTable } from "@tanstack/react-table"


import {
    columnFilteringFeature,
    columnVisibilityFeature,
    createFilteredRowModel,
    createPaginatedRowModel,
    createSortedRowModel,
    filterFn_includesString,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,
    sortFn_alphanumeric,
    sortFn_text,
    tableFeatures,
} from "@tanstack/react-table"

// New in v9: declare the features this table uses — anything you don't
// register is tree-shaken out of the bundle.
const features = tableFeatures({
    columnFilteringFeature,
    columnVisibilityFeature,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,
    filteredRowModel: createFilteredRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
    sortedRowModel: createSortedRowModel(),
    filterFns: { includesString: filterFn_includesString },
    sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
})

// Pass this as the first generic argument to `ColumnDef`, `Column`, `Table`,
// and `Row` so each type knows which feature APIs are available.
type DataTableFeatures = typeof features

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.


import { MoreHorizontal } from "lucide-react"


import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"




type ColumnHeaders<TData> = {
    Header: string
    Accessor: Extract<keyof TData, string>
}

export default function DataTable<TData extends RowData>(
    {
        ColumnHeaders,
        data,
        actionsOn,

    }:
        {
            ColumnHeaders: ColumnHeaders<TData>[],
            data: TData[],
            actionsOn: boolean
        }
) {



    // Use `accessor` for data columns and `display` for columns without one.
    const columnHelper = createColumnHelper<DataTableFeatures, TData>()

    const columns = columnHelper.columns([

        ...ColumnHeaders.map((column) =>
            columnHelper.accessor(
                (row) => row[column.Accessor],
                {
                    id: column.Accessor,
                    header: column.Header,
                }
            )
        ),

        ...(actionsOn ? [columnHelper.display({
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const item = row.original
                const ItemData = JSON.stringify(item);

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                />
                            }
                        >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>
                                    Actions
                                </DropdownMenuLabel>

                                <DropdownMenuItem
                                    onClick={() =>
                                        navigator.clipboard.writeText(
                                            String(ItemData)
                                        )
                                    }
                                >
                                    Copy
                                </DropdownMenuItem>
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem>
                                View customer
                            </DropdownMenuItem>

                            <DropdownMenuItem>
                                View payment details
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        })] : []),

    ])




    const table = useTable({
        features,
        data,
        columns,
    })

    return (
        <div className="overflow-hidden rounded-md border w-full">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : (
                                            <table.FlexRender header={header} />
                                        )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        <table.FlexRender cell={cell} />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}


