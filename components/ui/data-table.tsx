"use client";

import {
    type ColumnDef,
    type RowData,
    type RowSelectionState,
    columnVisibilityFeature,
    rowSelectionFeature,
    tableFeatures,
    useTable,
} from "@tanstack/react-table";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    ChevronLeft,
    ChevronRight,
    Copy,
    MoreHorizontal,
    Pencil,
    Settings2,
    Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const features = tableFeatures({
    columnVisibilityFeature,
    rowSelectionFeature,
});

type Features = typeof features;

type DataTableResult<TData> =
    | {
        success: true;
        data: TData[];
    }
    | {
        success: false;
        errors?: {
            message?: string;
        }[];
    };

type CountResult =
    | {
        success: true;
        data: number;
    }
    | {
        success: false;
        errors?: {
            message?: string;
        }[];
    };

type DataTableProps<TData extends RowData> = {
    initialData: TData[];
    initialTotal: number;
    pageSize: number;

    fetchData: (
        offset: number,
        limit: number
    ) => Promise<DataTableResult<TData>>;

    searchData: (
        search: string,
        limit: number,
        offset: number
    ) => Promise<DataTableResult<TData>>;

    getTotal: () => Promise<CountResult>;

    getSearchTotal: (
        search: string
    ) => Promise<CountResult>;

    onDelete: (
        key: string
    ) => Promise<unknown>;

    onEdit?: (
        row: TData
    ) => void;

    getRowId?: (
        row: TData
    ) => string;

    getCopyValue?: (
        row: TData
    ) => string;

    columns?: ColumnDef<
        Features,
        TData
    >[];
};

function formatColumnName(
    name: string
) {
    return name
        .replace(
            /([a-z])([A-Z])/g,
            "$1 $2"
        )
        .replace(
            /_/g,
            " "
        )
        .replace(
            /\b\w/g,
            (char) =>
                char.toUpperCase()
        );
}

function formatCellValue(
    value: unknown
): string {
    if (
        value === null ||
        value === undefined
    ) {
        return "-";
    }

    if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
    ) {
        return String(value);
    }

    if (
        typeof value === "object"
    ) {
        try {
            return JSON.stringify(
                value
            );
        } catch {
            return "[Object]";
        }
    }

    return String(value);
}

export function DataTable<
    TData extends RowData
>({
    initialData,
    initialTotal,
    pageSize,
    fetchData,
    searchData,
    getTotal,
    getSearchTotal,
    onDelete,
    onEdit,
    getRowId,
    getCopyValue,
    columns: customColumns,
}: DataTableProps<TData>) {
    const [data, setData] =
        useState<TData[]>(
            initialData
        );

    const [total, setTotal] =
        useState(initialTotal);

    const [search, setSearch] =
        useState("");

    const [pageIndex, setPageIndex] =
        useState(0);

    const [loading, setLoading] =
        useState(false);

    const [
        rowSelection,
        setRowSelection,
    ] = useState<RowSelectionState>({});

    /*
     * Prevent the initial search effect
     * from fetching again because the
     * initial data already came from
     * the server.
     */
    const isFirstRender =
        useRef(true);

    /*
     * Generate columns automatically
     * when custom columns aren't provided.
     */
    const columns = useMemo<
        ColumnDef<Features, TData>[]
    >(() => {
        if (customColumns) {
            return customColumns;
        }

        if (!data.length) {
            return [];
        }

        const keys = Object.keys(
            data[0]
        ) as Array<keyof TData>;

        return keys.map(
            (key) => ({
                accessorKey:
                    String(key),

                header:
                    formatColumnName(
                        String(key)
                    ),

                cell: (info) =>
                    formatCellValue(
                        info.getValue()
                    ),
            })
        );
    }, [
        customColumns,
        data,
    ]);

    /*
     * TanStack Table.
     */
    const table = useTable<
        Features,
        TData
    >({
        features,
        data,
        columns,

        state: {
            rowSelection,
        },

        onRowSelectionChange:
            setRowSelection,
    });

    /*
     * Load server-side data.
     */
    const loadData = useCallback(
        async (
            page: number,
            searchValue: string
        ) => {
            setLoading(true);

            try {
                const offset =
                    page * pageSize;

                if (
                    searchValue.trim()
                ) {
                    const [
                        itemsResult,
                        countResult,
                    ] =
                        await Promise.all([
                            searchData(
                                searchValue,
                                pageSize,
                                offset
                            ),
                            getSearchTotal(
                                searchValue
                            ),
                        ]);

                    if (
                        itemsResult.success
                    ) {
                        setData(
                            itemsResult.data
                        );
                    }

                    if (
                        countResult.success
                    ) {
                        setTotal(
                            countResult.data
                        );
                    }
                } else {
                    const [
                        itemsResult,
                        countResult,
                    ] =
                        await Promise.all([
                            fetchData(
                                offset,
                                pageSize
                            ),
                            getTotal(),
                        ]);

                    if (
                        itemsResult.success
                    ) {
                        setData(
                            itemsResult.data
                        );
                    }

                    if (
                        countResult.success
                    ) {
                        setTotal(
                            countResult.data
                        );
                    }
                }

                setRowSelection({});
            } finally {
                setLoading(false);
            }
        },
        [
            pageSize,
            fetchData,
            searchData,
            getTotal,
            getSearchTotal,
        ]
    );

    /*
     * Debounced server-side search.
     */
    useEffect(() => {
        if (
            isFirstRender.current
        ) {
            isFirstRender.current =
                false;

            return;
        }

        const timeout =
            setTimeout(() => {
                setPageIndex(0);

                loadData(
                    0,
                    search
                );
            }, 400);

        return () => {
            clearTimeout(timeout);
        };
    }, [
        search,
        loadData,
    ]);

    /*
     * Pagination.
     */
    const pageCount = Math.max(
        1,
        Math.ceil(
            total / pageSize
        )
    );

    const goToPage = useCallback(
        async (
            page: number
        ) => {
            if (
                page < 0 ||
                page >= pageCount ||
                loading
            ) {
                return;
            }

            setPageIndex(page);

            await loadData(
                page,
                search
            );
        },
        [
            pageCount,
            loading,
            loadData,
            search,
        ]
    );

    /*
     * Selected rows.
     */
    const selectedRows =
        table
            .getSelectedRowModel()
            .rows;

    /*
     * Resolve the row key.
     */
    const getKey = useCallback(
        (
            row: TData,
            rowId?: string
        ) => {
            if (getRowId) {
                return getRowId(row);
            }

            if (rowId) {
                return rowId;
            }

            throw new Error(
                "DataTable: getRowId is required when using delete."
            );
        },
        [getRowId]
    );

    /*
     * Delete selected rows.
     */
    const handleDelete =
        useCallback(
            async () => {
                if (
                    !selectedRows.length
                ) {
                    return;
                }

                setLoading(true);

                try {
                    for (
                        const row of selectedRows
                    ) {
                        const key =
                            getKey(
                                row.original,
                                row.id
                            );

                        await onDelete(
                            key
                        );
                    }

                    await loadData(
                        pageIndex,
                        search
                    );
                } finally {
                    setLoading(false);
                }
            },
            [
                selectedRows,
                getKey,
                onDelete,
                loadData,
                pageIndex,
                search,
            ]
        );

    /*
     * Delete one row.
     */
    const handleDeleteRow =
        useCallback(
            async (
                row: TData,
                rowId: string
            ) => {
                const key =
                    getKey(
                        row,
                        rowId
                    );

                setLoading(true);

                try {
                    await onDelete(
                        key
                    );

                    await loadData(
                        pageIndex,
                        search
                    );
                } finally {
                    setLoading(false);
                }
            },
            [
                getKey,
                onDelete,
                loadData,
                pageIndex,
                search,
            ]
        );

    /*
     * Copy selected rows.
     */
    const handleCopy =
        useCallback(
            async () => {
                if (
                    !selectedRows.length
                ) {
                    return;
                }

                const values =
                    selectedRows.map(
                        (row) => {
                            if (
                                getCopyValue
                            ) {
                                return getCopyValue(
                                    row.original
                                );
                            }

                            return JSON.stringify(
                                row.original
                            );
                        }
                    );

                await navigator.clipboard.writeText(
                    values.join("\n")
                );
            },
            [
                selectedRows,
                getCopyValue,
            ]
        );

    /*
     * Columns that can be hidden.
     */
    const hideableColumns =
        table
            .getAllColumns()
            .filter(
                (column) =>
                    column.getCanHide()
            );

    return (
        <div className="w-full space-y-4">

            {/* Toolbar */}

            <div className="flex w-full items-center justify-between gap-4">

                <Input
                    placeholder="Search..."
                    value={search}
                    onChange={(event) =>
                        setSearch(
                            event.target.value
                        )
                    }
                    className="max-w-sm"
                />

                <div className="flex items-center gap-2">

                    {/* Column Visibility */}

                    <DropdownMenu>

                        <DropdownMenuTrigger
                            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                            <Settings2 className="size-4" />
                            Columns
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            align="end"
                            className="w-48"
                        >
                            {hideableColumns.map(
                                (
                                    column
                                ) => (
                                    <DropdownMenuCheckboxItem
                                        key={
                                            column.id
                                        }
                                        checked={
                                            column.getIsVisible()
                                        }
                                        onCheckedChange={(
                                            value
                                        ) =>
                                            column.toggleVisibility(
                                                !!value
                                            )
                                        }
                                    >
                                        {typeof column
                                            .columnDef
                                            .header ===
                                            "string"
                                            ? column
                                                .columnDef
                                                .header
                                            : formatColumnName(
                                                column.id
                                            )}
                                    </DropdownMenuCheckboxItem>
                                )
                            )}
                        </DropdownMenuContent>

                    </DropdownMenu>

                    {/* Copy */}

                    <Button
                        variant="outline"
                        size="sm"
                        disabled={
                            !selectedRows.length ||
                            loading
                        }
                        onClick={
                            handleCopy
                        }
                    >
                        <Copy className="mr-2 size-4" />
                        Copy
                    </Button>

                    {/* Bulk Delete */}

                    <Button
                        variant="destructive"
                        size="sm"
                        disabled={
                            !selectedRows.length ||
                            loading
                        }
                        onClick={
                            handleDelete
                        }
                    >
                        <Trash2 className="mr-2 size-4" />
                        Delete
                    </Button>

                </div>
            </div>

            {/* Table */}

            <div className="w-full overflow-x-auto rounded-md border">

                <table className="w-full min-w-max">

                    <thead>

                        {table
                            .getHeaderGroups()
                            .map(
                                (
                                    headerGroup
                                ) => (
                                    <tr
                                        key={
                                            headerGroup.id
                                        }
                                    >

                                        {/* Select All */}

                                        <th className="w-12 px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={table.getIsAllRowsSelected()}
                                                ref={(
                                                    element
                                                ) => {
                                                    if (
                                                        element
                                                    ) {
                                                        element.indeterminate =
                                                            table.getIsSomeRowsSelected();
                                                    }
                                                }}
                                                onChange={table.getToggleAllRowsSelectedHandler()}
                                            />
                                        </th>

                                        {/* Columns */}

                                        {headerGroup.headers.map(
                                            (
                                                header
                                            ) => (
                                                <th
                                                    key={
                                                        header.id
                                                    }
                                                    className="px-4 py-3 text-left font-medium"
                                                >
                                                    {header.isPlaceholder
                                                        ? null
                                                        : table.FlexRender(
                                                            {
                                                                header,
                                                            }
                                                        )}
                                                </th>
                                            )
                                        )}

                                        {/* Actions */}

                                        {onEdit && (
                                            <th className="w-20 px-4 py-3 text-right">
                                                Actions
                                            </th>
                                        )}

                                    </tr>
                                )
                            )}

                    </thead>

                    <tbody>

                        {loading ? (

                            <tr>
                                <td
                                    colSpan={
                                        columns.length +
                                        (onEdit
                                            ? 2
                                            : 1)
                                    }
                                    className="h-24 text-center"
                                >
                                    Loading...
                                </td>
                            </tr>

                        ) : data.length ? (

                            table
                                .getRowModel()
                                .rows
                                .map(
                                    (
                                        row
                                    ) => (
                                        <tr
                                            key={
                                                row.id
                                            }
                                            className="border-t"
                                        >

                                            {/* Selection */}

                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={row.getIsSelected()}
                                                    onChange={row.getToggleSelectedHandler()}
                                                />
                                            </td>

                                            {/* Cells */}

                                            {row
                                                .getVisibleCells()
                                                .map(
                                                    (
                                                        cell
                                                    ) => (
                                                        <td
                                                            key={
                                                                cell.id
                                                            }
                                                            className="px-4 py-3"
                                                        >
                                                            {table.FlexRender(
                                                                {
                                                                    cell,
                                                                }
                                                            )}
                                                        </td>
                                                    )
                                                )}

                                            {/* Row Actions */}

                                            {onEdit && (
                                                <td className="px-4 py-3 text-right">

                                                    <DropdownMenu>

                                                        <DropdownMenuTrigger
                                                            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                                                        >
                                                            <MoreHorizontal className="size-4" />

                                                            <span className="sr-only">
                                                                Open actions
                                                            </span>
                                                        </DropdownMenuTrigger>

                                                        <DropdownMenuContent align="end">

                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    onEdit(
                                                                        row.original
                                                                    )
                                                                }
                                                            >
                                                                <Pencil className="mr-2 size-4" />
                                                                Edit
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() =>
                                                                    handleDeleteRow(
                                                                        row.original,
                                                                        row.id
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="mr-2 size-4" />
                                                                Delete
                                                            </DropdownMenuItem>

                                                        </DropdownMenuContent>

                                                    </DropdownMenu>

                                                </td>
                                            )}

                                        </tr>
                                    )
                                )

                        ) : (

                            <tr>
                                <td
                                    colSpan={
                                        columns.length +
                                        (onEdit
                                            ? 2
                                            : 1)
                                    }
                                    className="h-24 text-center"
                                >
                                    No results found.
                                </td>
                            </tr>

                        )}

                    </tbody>

                </table>

            </div>

            {/* Pagination */}

            <div className="flex w-full items-center justify-between">

                <p className="text-sm text-muted-foreground">
                    {total}{" "}
                    {total === 1
                        ? "result"
                        : "results"}
                </p>

                <div className="flex items-center gap-2">

                    <Button
                        variant="outline"
                        size="icon"
                        disabled={
                            pageIndex === 0 ||
                            loading
                        }
                        onClick={() =>
                            goToPage(
                                pageIndex - 1
                            )
                        }
                    >
                        <ChevronLeft />
                    </Button>

                    <span className="text-sm">
                        Page{" "}
                        {pageIndex + 1}{" "}
                        of{" "}
                        {pageCount}
                    </span>

                    <Button
                        variant="outline"
                        size="icon"
                        disabled={
                            pageIndex >=
                            pageCount - 1 ||
                            loading
                        }
                        onClick={() =>
                            goToPage(
                                pageIndex + 1
                            )
                        }
                    >
                        <ChevronRight />
                    </Button>

                </div>

            </div>

        </div>
    );
}