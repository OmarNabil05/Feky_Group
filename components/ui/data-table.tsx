"use client"

import React from "react"

import {
    createColumnHelper,
    RowData,
    useTable,
} from "@tanstack/react-table"

import {
    ArrowDown,
    ArrowUp,
    ChevronsUpDown,
    ChevronsLeft,
    ChevronsRight,
    EyeOff,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    Copy,
    Download,
    Plus,
    Trash2,
} from "lucide-react"

import {
    columnFilteringFeature,
    columnVisibilityFeature,
    globalFilteringFeature,
    createFilteredRowModel,
    createPaginatedRowModel,
    createSortedRowModel,
    filterFn_includesString,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,
    tableFeatures,
    type SortingState,
    type ColumnVisibilityState,
    type RowSelectionState,
} from "@tanstack/react-table"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { toast } from "@/components/ui/toast"


// =========================================================
// TABLE FEATURES
// =========================================================

const features = tableFeatures({
    columnFilteringFeature,
    globalFilteringFeature,
    columnVisibilityFeature,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,

    filteredRowModel: createFilteredRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
    sortedRowModel: createSortedRowModel(),

    filterFns: {
        includesString: filterFn_includesString,
    },

    sortFns: {
        alphanumeric: (rowA, rowB, columnId) =>
            String(
                rowA.getValue(columnId) ?? ""
            ).localeCompare(
                String(
                    rowB.getValue(columnId) ?? ""
                ),
                undefined,
                {
                    numeric: true,
                }
            ),

        text: (rowA, rowB, columnId) =>
            String(
                rowA.getValue(columnId) ?? ""
            ).localeCompare(
                String(
                    rowB.getValue(columnId) ?? ""
                )
            ),
    },
})

type DataTableFeatures = typeof features


// =========================================================
// COLUMN CONFIG
// =========================================================

type ColumnHeaders<TData> = {
    Header: string
    Accessor: Extract<keyof TData, string>
}


// =========================================================
// RESULT TYPES
// =========================================================

export type DeleteResult = {
    success: boolean
    message?: string
}


// =========================================================
// FEATURE CONFIG
// =========================================================

export type DataTableFeatureConfig = {
    search?: boolean
    sorting?: boolean
    pagination?: boolean
    selection?: boolean
    export?: boolean
    columnVisibility?: boolean

    actions?: boolean
    copy?: boolean
    view?: boolean
    edit?: boolean
    delete?: boolean

    create?: boolean
}


// =========================================================
// CREATE FORM PROPS
// =========================================================

type CreateFormProps<TData> = {
    onSuccess: (
        newRow: TData
    ) => void
}


// =========================================================
// EDIT FORM PROPS
// =========================================================

type EditFormProps<TData> = {
    row: TData

    onSuccess: (
        updatedRow: TData
    ) => void
}


// =========================================================
// DATA TABLE PROPS
// =========================================================

type DataTableProps<TData extends RowData> = {
    ColumnHeaders: ColumnHeaders<TData>[]

    data: TData[]

    features?: DataTableFeatureConfig

    /*
     * Must return a unique ID for every row.
     *
     * Example:
     *
     * getRowId={(item) => item.CardCode!}
     */
    getRowId: (
        row: TData
    ) => string

    /*
     * Create form.
     *
     * The form must call:
     *
     * onSuccess(createdRow)
     *
     * after the database insert succeeds.
     */
    createForm?: (
        props: CreateFormProps<TData>
    ) => React.ReactNode

    /*
     * Edit form.
     *
     * The form must call:
     *
     * onSuccess(updatedRow)
     *
     * after the database update succeeds.
     */
    editForm?: (
        props: EditFormProps<TData>
    ) => React.ReactNode

    onDelete?: (
        row: TData
    ) => Promise<DeleteResult>
}


// =========================================================
// DATA TABLE
// =========================================================

export default function DataTable<
    TData extends RowData
>({
    ColumnHeaders,
    data,
    features: featuresProp,
    getRowId,
    createForm,
    editForm,
    onDelete,
}: DataTableProps<TData>) {

    // =====================================================
    // FEATURE CONFIG
    // =====================================================

    /*
     * Everything is enabled by default except create.
     *
     * This keeps the old DataTable behavior.
     */
    const featureConfig = {
        search: true,
        sorting: true,
        pagination: true,
        selection: true,
        export: true,
        columnVisibility: true,

        actions: true,
        copy: true,
        view: true,
        edit: true,
        delete: true,

        create: false,

        ...featuresProp,
    }


    // =====================================================
    // LOCAL TABLE MUTATIONS
    // =====================================================

    /*
     * `data` remains the server-provided source of truth.
     *
     * These states are only temporary UI overlays.
     *
     * addedRows
     * -> rows created locally but not yet present
     *    in the server-provided `data`.
     *
     * updatedRows
     * -> temporarily replaces edited rows.
     *
     * deletedRowIds
     * -> temporarily hides deleted rows.
     */

    const [addedRows, setAddedRows] =
        React.useState<Map<string, TData>>(
            () => new Map()
        )

    const [deletedRowIds, setDeletedRowIds] =
        React.useState<Set<string>>(
            () => new Set()
        )

    const [updatedRows, setUpdatedRows] =
        React.useState<Map<string, TData>>(
            () => new Map()
        )


    // =====================================================
    // TABLE DATA
    // =====================================================

    /*
     * Build the rows displayed by the table.
     *
     * Result:
     *
     * locally added rows
     * +
     * server rows
     *
     * while applying local edits/deletes.
     *
     * If the parent later refreshes and the created row
     * appears in `data`, we don't add it twice.
     */

    const tableData =
        React.useMemo(() => {

            const serverIds =
                new Set(
                    data.map(
                        (row) =>
                            getRowId(row)
                    )
                )


            // ---------------------------------------------
            // LOCALLY ADDED ROWS
            // ---------------------------------------------

            const locallyAddedRows =
                Array.from(
                    addedRows.values()
                )
                    .filter(
                        (row) =>
                            !serverIds.has(
                                getRowId(row)
                            )
                    )
                    .map(
                        (row) =>
                            updatedRows.get(
                                getRowId(row)
                            ) ?? row
                    )


            // ---------------------------------------------
            // SERVER ROWS
            // ---------------------------------------------

            const serverRows =
                data
                    .filter(
                        (row) =>
                            !deletedRowIds.has(
                                getRowId(row)
                            )
                    )
                    .map(
                        (row) =>
                            updatedRows.get(
                                getRowId(row)
                            ) ?? row
                    )


            return [
                ...locallyAddedRows,
                ...serverRows,
            ]

        }, [
            data,
            addedRows,
            deletedRowIds,
            updatedRows,
            getRowId,
        ])


    // =====================================================
    // TABLE STATE
    // =====================================================

    const [sorting, setSorting] =
        React.useState<SortingState>([])

    const [globalFilter, setGlobalFilter] =
        React.useState("")

    const [columnVisibility, setColumnVisibility] =
        React.useState<ColumnVisibilityState>({})

    const [rowSelection, setRowSelection] =
        React.useState<RowSelectionState>({})


    // =====================================================
    // CREATE DIALOG STATE
    // =====================================================

    const [createDialogOpen, setCreateDialogOpen] =
        React.useState(false)

    const [createFormKey, setCreateFormKey] =
        React.useState(0)


    // =====================================================
    // EDIT DIALOG STATE
    // =====================================================

    const [editingRow, setEditingRow] =
        React.useState<TData | null>(null)

    const [editDialogOpen, setEditDialogOpen] =
        React.useState(false)

    const [editFormKey, setEditFormKey] =
        React.useState(0)


    // =====================================================
    // CREATE HANDLER
    // =====================================================

    function handleCreate() {

        if (!createForm) {

            toast.add({
                type: "error",
                title: "Create unavailable",
                description:
                    "No create form was provided.",
            })

            return
        }


        setCreateFormKey(
            (value) =>
                value + 1
        )


        setCreateDialogOpen(true)
    }


    // =====================================================
    // CREATE SUCCESS
    // =====================================================

    function handleCreateSuccess(
        newRow: TData
    ) {

        const rowId =
            getRowId(newRow)


        // ---------------------------------------------
        // Add the new row immediately
        // ---------------------------------------------

        setAddedRows(
            (current) => {

                const next =
                    new Map(current)

                next.set(
                    rowId,
                    newRow
                )

                return next
            }
        )


        // ---------------------------------------------
        // Make sure it isn't marked deleted
        // ---------------------------------------------

        setDeletedRowIds(
            (current) => {

                const next =
                    new Set(current)

                next.delete(rowId)

                return next
            }
        )


        // ---------------------------------------------
        // Remove any old local edit
        // ---------------------------------------------

        setUpdatedRows(
            (current) => {

                const next =
                    new Map(current)

                next.delete(rowId)

                return next
            }
        )


        // ---------------------------------------------
        // Close dialog
        // ---------------------------------------------

        setCreateDialogOpen(false)
    }


    // =====================================================
    // EDIT HANDLER
    // =====================================================

    function handleEdit(
        row: TData
    ) {

        if (!editForm) {

            toast.add({
                type: "error",
                title: "Edit unavailable",
                description:
                    "No edit form was provided.",
            })

            return
        }


        setEditingRow(row)

        setEditFormKey(
            (value) =>
                value + 1
        )

        setEditDialogOpen(true)
    }


    // =====================================================
    // EDIT SUCCESS
    // =====================================================

    function handleEditSuccess(
        updatedRow: TData
    ) {

        const rowId =
            getRowId(updatedRow)


        // ---------------------------------------------
        // Store updated row
        // ---------------------------------------------

        setUpdatedRows(
            (current) => {

                const next =
                    new Map(current)

                next.set(
                    rowId,
                    updatedRow
                )

                return next
            }
        )


        // ---------------------------------------------
        // If it was deleted locally, restore it
        // ---------------------------------------------

        setDeletedRowIds(
            (current) => {

                const next =
                    new Set(current)

                next.delete(rowId)

                return next
            }
        )


        // ---------------------------------------------
        // If this is a locally-added row,
        // update its local version too.
        // ---------------------------------------------

        setAddedRows(
            (current) => {

                if (!current.has(rowId)) {
                    return current
                }

                const next =
                    new Map(current)

                next.set(
                    rowId,
                    updatedRow
                )

                return next
            }
        )


        // ---------------------------------------------
        // Close dialog
        // ---------------------------------------------

        setEditDialogOpen(false)

        setEditingRow(null)
    }


    // =====================================================
    // DELETE SINGLE ROW
    // =====================================================

    async function handleDelete(
        row: TData
    ) {

        if (!onDelete) {

            toast.add({
                type: "error",
                title: "Delete unavailable",
                description:
                    "onDelete function is not provided.",
            })

            return
        }


        try {

            const result =
                await onDelete(row)


            if (!result.success) {

                toast.add({
                    type: "error",
                    title: "Delete failed",
                    description:
                        result.message ??
                        "Unable to delete the row.",
                })

                return
            }


            const rowId =
                getRowId(row)


            // ---------------------------------------------
            // Hide deleted row
            // ---------------------------------------------

            setDeletedRowIds(
                (current) => {

                    const next =
                        new Set(current)

                    next.add(rowId)

                    return next
                }
            )


            // ---------------------------------------------
            // Remove local added version
            // ---------------------------------------------

            setAddedRows(
                (current) => {

                    const next =
                        new Map(current)

                    next.delete(rowId)

                    return next
                }
            )


            // ---------------------------------------------
            // Remove local edited version
            // ---------------------------------------------

            setUpdatedRows(
                (current) => {

                    const next =
                        new Map(current)

                    next.delete(rowId)

                    return next
                }
            )


            // ---------------------------------------------
            // Remove from selection
            // ---------------------------------------------

            setRowSelection(
                (current) => {

                    const next = {
                        ...current,
                    }

                    delete next[rowId]

                    return next
                }
            )


            toast.add({
                type: "success",
                title: "Deleted",
                description:
                    result.message ??
                    "The row was deleted successfully.",
            })

        } catch {

            toast.add({
                type: "error",
                title: "Delete failed",
                description:
                    "Something went wrong while deleting the row.",
            })
        }
    }


    // =====================================================
    // GET SELECTED ROWS
    // =====================================================

    function getSelectedRows(): TData[] {

        return table
            .getFilteredSelectedRowModel()
            .rows
            .map(
                (row) =>
                    row.original
            )
    }


    // =====================================================
    // COPY SELECTED ROWS
    // =====================================================

    async function handleCopySelected() {

        const rows =
            getSelectedRows()


        if (!rows.length) {

            toast.add({
                type: "error",
                title: "Nothing selected",
                description:
                    "Select at least one row first.",
            })

            return
        }


        try {

            const text =
                rows
                    .map(
                        (row) =>
                            ColumnHeaders
                                .map(
                                    (column) =>
                                        String(
                                            row[
                                            column.Accessor
                                            ] ?? ""
                                        )
                                )
                                .join("\t")
                    )
                    .join("\n")


            await navigator.clipboard.writeText(
                text
            )


            toast.add({
                type: "success",
                title: "Copied",
                description:
                    `${rows.length} row(s) copied successfully.`,
            })

        } catch {

            toast.add({
                type: "error",
                title: "Copy failed",
                description:
                    "Unable to copy the selected rows.",
            })
        }
    }


    // =====================================================
    // DELETE SELECTED ROWS
    // =====================================================

    async function handleDeleteSelected() {

        if (!onDelete) {

            toast.add({
                type: "error",
                title: "Delete unavailable",
                description:
                    "onDelete function is not provided.",
            })

            return
        }


        const rows =
            getSelectedRows()


        if (!rows.length) {

            toast.add({
                type: "error",
                title: "Nothing selected",
                description:
                    "Select at least one row first.",
            })

            return
        }


        try {

            /*
             * Delete one by one for now.
             */
            const successfulIds =
                new Set<string>()


            for (const row of rows) {

                const result =
                    await onDelete(row)


                if (!result.success) {

                    toast.add({
                        type: "error",
                        title: "Delete failed",
                        description:
                            result.message ??
                            "Unable to delete one of the selected rows.",
                    })

                    break
                }


                successfulIds.add(
                    getRowId(row)
                )
            }


            if (!successfulIds.size) {
                return
            }


            // ---------------------------------------------
            // Hide successful deletes
            // ---------------------------------------------

            setDeletedRowIds(
                (current) => {

                    const next =
                        new Set(current)

                    for (
                        const id
                        of successfulIds
                    ) {
                        next.add(id)
                    }

                    return next
                }
            )


            // ---------------------------------------------
            // Remove locally-added rows
            // ---------------------------------------------

            setAddedRows(
                (current) => {

                    const next =
                        new Map(current)

                    for (
                        const id
                        of successfulIds
                    ) {
                        next.delete(id)
                    }

                    return next
                }
            )


            // ---------------------------------------------
            // Remove edited versions
            // ---------------------------------------------

            setUpdatedRows(
                (current) => {

                    const next =
                        new Map(current)

                    for (
                        const id
                        of successfulIds
                    ) {
                        next.delete(id)
                    }

                    return next
                }
            )


            // ---------------------------------------------
            // Clear selection
            // ---------------------------------------------

            setRowSelection({})


            toast.add({
                type: "success",
                title: "Deleted",
                description:
                    `${successfulIds.size} row(s) deleted successfully.`,
            })

        } catch {

            toast.add({
                type: "error",
                title: "Delete failed",
                description:
                    "Something went wrong while deleting the selected rows.",
            })
        }
    }


    // =====================================================
    // CSV VALUE
    // =====================================================

    function csvValue(
        value: unknown
    ): string {

        if (
            value === null ||
            value === undefined
        ) {
            return ""
        }


        return `"${String(value)
            .replaceAll('"', '""')}"`

    }


    // =====================================================
    // EXPORT CSV
    // =====================================================

    function exportCSV(
        rows: TData[],
        filename: string
    ) {

        if (!rows.length) {

            toast.add({
                type: "error",
                title: "Nothing to export",
                description:
                    "There are no rows to export.",
            })

            return
        }


        const headers =
            ColumnHeaders
                .map(
                    (column) =>
                        csvValue(
                            column.Header
                        )
                )
                .join(",")


        const body =
            rows
                .map(
                    (row) =>
                        ColumnHeaders
                            .map(
                                (column) =>
                                    csvValue(
                                        row[
                                        column.Accessor
                                        ]
                                    )
                            )
                            .join(",")
                )
                .join("\n")


        /*
         * BOM helps Excel recognize
         * UTF-8 / Arabic / Unicode text.
         */
        const csv =
            `\ufeff${headers}\n${body}`


        const blob =
            new Blob(
                [csv],
                {
                    type:
                        "text/csv;charset=utf-8;",
                }
            )


        const url =
            URL.createObjectURL(blob)


        const link =
            document.createElement("a")


        link.href = url
        link.download = filename


        document.body.appendChild(link)

        link.click()

        document.body.removeChild(link)

        URL.revokeObjectURL(url)


        toast.add({
            type: "success",
            title: "Exported",
            description:
                `${rows.length} row(s) exported successfully.`,
        })
    }


    // =====================================================
    // COLUMN HELPER
    // =====================================================

    const columnHelper =
        createColumnHelper<
            DataTableFeatures,
            TData
        >()


    // =====================================================
    // COLUMNS
    // =====================================================

    const columns =
        columnHelper.columns([

            // =================================================
            // SELECT
            // =================================================

            ...(featureConfig.selection
                ? [
                    columnHelper.display({

                        id: "select",

                        header: ({
                            table,
                        }) => (

                            <Checkbox
                                checked={
                                    table.getIsAllPageRowsSelected()
                                }

                                indeterminate={
                                    table.getIsSomePageRowsSelected() &&
                                    !table.getIsAllPageRowsSelected()
                                }

                                onCheckedChange={
                                    (value) =>
                                        table.toggleAllPageRowsSelected(
                                            !!value
                                        )
                                }

                                aria-label="Select all"
                            />

                        ),

                        cell: ({
                            row,
                        }) => (

                            <Checkbox
                                checked={
                                    row.getIsSelected()
                                }

                                onCheckedChange={
                                    (value) =>
                                        row.toggleSelected(
                                            !!value
                                        )
                                }

                                aria-label="Select row"
                            />

                        ),

                        enableSorting: false,
                        enableHiding: false,
                    }),
                ]
                : []),


            // =================================================
            // DATA COLUMNS
            // =================================================

            ...ColumnHeaders.map(
                (column) =>

                    columnHelper.accessor(
                        (row) =>
                            row[
                            column.Accessor
                            ],

                        {
                            id:
                                column.Accessor,

                            enableSorting:
                                featureConfig.sorting,

                            enableHiding:
                                featureConfig.columnVisibility,

                            header: ({
                                column:
                                tableColumn,
                            }) => {

                                const sorted =
                                    tableColumn.getIsSorted()


                                /*
                                 * If sorting and hiding
                                 * are both disabled,
                                 * just display the title.
                                 */
                                if (
                                    !featureConfig.sorting &&
                                    !featureConfig.columnVisibility
                                ) {
                                    return column.Header
                                }


                                return (

                                    <DropdownMenu>

                                        <DropdownMenuTrigger
                                            render={
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="-ml-3 h-8"
                                                />
                                            }
                                        >

                                            <span>
                                                {
                                                    column.Header
                                                }
                                            </span>


                                            {featureConfig.sorting && (

                                                sorted === "desc" ? (

                                                    <ArrowDown
                                                        className="ml-2 h-4 w-4"
                                                    />

                                                ) : sorted === "asc" ? (

                                                    <ArrowUp
                                                        className="ml-2 h-4 w-4"
                                                    />

                                                ) : (

                                                    <ChevronsUpDown
                                                        className="ml-2 h-4 w-4"
                                                    />

                                                )

                                            )}

                                        </DropdownMenuTrigger>


                                        <DropdownMenuContent
                                            align="start"
                                        >

                                            {featureConfig.sorting && (

                                                <>

                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            tableColumn.toggleSorting(
                                                                false
                                                            )
                                                        }
                                                    >
                                                        <ArrowUp />
                                                        Asc
                                                    </DropdownMenuItem>


                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            tableColumn.toggleSorting(
                                                                true
                                                            )
                                                        }
                                                    >
                                                        <ArrowDown />
                                                        Desc
                                                    </DropdownMenuItem>

                                                </>

                                            )}


                                            {featureConfig.sorting &&
                                                featureConfig.columnVisibility && (

                                                    <DropdownMenuSeparator />

                                                )}


                                            {featureConfig.columnVisibility && (

                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        tableColumn.toggleVisibility(
                                                            false
                                                        )
                                                    }
                                                >
                                                    <EyeOff />
                                                    Hide
                                                </DropdownMenuItem>

                                            )}

                                        </DropdownMenuContent>

                                    </DropdownMenu>

                                )
                            },
                        }
                    )
            ),


            // =================================================
            // ACTIONS
            // =================================================

            ...(featureConfig.actions
                ? [

                    columnHelper.display({

                        id: "actions",

                        header: "Actions",

                        enableHiding: false,

                        enableSorting: false,

                        cell: ({
                            row,
                        }) => {

                            const item =
                                row.original


                            async function handleCopy() {

                                try {

                                    await navigator.clipboard.writeText(
                                        JSON.stringify(
                                            item,
                                            null,
                                            2
                                        )
                                    )


                                    toast.add({
                                        type: "success",
                                        title: "Copied",
                                        description:
                                            "Row copied successfully.",
                                    })

                                } catch {

                                    toast.add({
                                        type: "error",
                                        title: "Copy failed",
                                        description:
                                            "Unable to copy the row.",
                                    })
                                }
                            }


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

                                        <span className="sr-only">
                                            Open menu
                                        </span>

                                        <MoreHorizontal
                                            className="h-4 w-4"
                                        />

                                    </DropdownMenuTrigger>


                                    <DropdownMenuContent
                                        align="end"
                                    >

                                        {featureConfig.copy && (

                                            <DropdownMenuItem
                                                onClick={
                                                    handleCopy
                                                }
                                            >
                                                <Copy />
                                                Copy
                                            </DropdownMenuItem>

                                        )}


                                        {featureConfig.copy &&
                                            (
                                                featureConfig.view ||
                                                (
                                                    featureConfig.edit &&
                                                    !!editForm
                                                ) ||
                                                (
                                                    featureConfig.delete &&
                                                    !!onDelete
                                                )
                                            ) && (

                                                <DropdownMenuSeparator />

                                            )}


                                        {featureConfig.view && (

                                            <DropdownMenuItem>
                                                View
                                            </DropdownMenuItem>

                                        )}


                                        {featureConfig.edit &&
                                            editForm && (

                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleEdit(
                                                            item
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </DropdownMenuItem>

                                            )}


                                        {featureConfig.delete &&
                                            onDelete && (

                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    onClick={() =>
                                                        handleDelete(
                                                            item
                                                        )
                                                    }
                                                >
                                                    <Trash2 />
                                                    Delete
                                                </DropdownMenuItem>

                                            )}

                                    </DropdownMenuContent>

                                </DropdownMenu>

                            )
                        },
                    }),

                ]
                : []),

        ])


    // =====================================================
    // TABLE
    // =====================================================

    const table =
        useTable({

            features,

            data:
                tableData,

            columns,

            getRowId,

            onSortingChange:
                setSorting,

            onGlobalFilterChange:
                setGlobalFilter,

            onColumnVisibilityChange:
                setColumnVisibility,

            onRowSelectionChange:
                setRowSelection,

            state: {
                sorting,
                globalFilter,
                columnVisibility,
                rowSelection,
            },
        })


    // =====================================================
    // SELECTED COUNT
    // =====================================================

    const selectedCount =
        featureConfig.selection
            ? table
                .getFilteredSelectedRowModel()
                .rows
                .length
            : 0


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <>

            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="flex flex-wrap items-center justify-between gap-2 py-4">

                {featureConfig.search ? (

                    <Input
                        placeholder="Search..."
                        value={globalFilter}
                        onChange={(event) =>
                            setGlobalFilter(
                                event.target.value
                            )
                        }
                        className="max-w-sm"
                    />

                ) : (

                    <div />

                )}


                <div className="flex flex-wrap items-center gap-2">

                    {/* =========================================
                        CREATE
                    ========================================= */}

                    {featureConfig.create &&
                        createForm && (

                            <Button
                                onClick={
                                    handleCreate
                                }
                            >
                                <Plus />
                                Add
                            </Button>

                        )}


                    {/* =========================================
                        SELECTED ACTIONS
                    ========================================= */}

                    {featureConfig.selection &&
                        selectedCount > 0 && (

                            <>

                                {featureConfig.copy && (

                                    <Button
                                        variant="outline"
                                        onClick={
                                            handleCopySelected
                                        }
                                    >
                                        <Copy />
                                        Copy
                                    </Button>

                                )}


                                {featureConfig.delete &&
                                    onDelete && (

                                        <Button
                                            variant="destructive"
                                            onClick={
                                                handleDeleteSelected
                                            }
                                        >
                                            <Trash2 />
                                            Delete ({
                                                selectedCount
                                            })
                                        </Button>

                                    )}

                            </>

                        )}


                    {/* =========================================
                        EXPORT
                    ========================================= */}

                    {featureConfig.export && (

                        <DropdownMenu>

                            <DropdownMenuTrigger
                                render={
                                    <Button
                                        variant="outline"
                                    />
                                }
                            >
                                <Download />
                                Export
                            </DropdownMenuTrigger>


                            <DropdownMenuContent
                                align="end"
                            >

                                <DropdownMenuItem
                                    onClick={() =>
                                        exportCSV(
                                            tableData,
                                            "items.csv"
                                        )
                                    }
                                >
                                    Export all
                                </DropdownMenuItem>


                                <DropdownMenuItem
                                    onClick={() =>
                                        exportCSV(
                                            table
                                                .getFilteredRowModel()
                                                .rows
                                                .map(
                                                    (row) =>
                                                        row.original
                                                ),
                                            "items-filtered.csv"
                                        )
                                    }
                                >
                                    Export filtered
                                </DropdownMenuItem>


                                <DropdownMenuItem
                                    disabled={
                                        selectedCount === 0
                                    }
                                    onClick={() =>
                                        exportCSV(
                                            getSelectedRows(),
                                            "items-selected.csv"
                                        )
                                    }
                                >
                                    Export selected
                                </DropdownMenuItem>

                            </DropdownMenuContent>

                        </DropdownMenu>

                    )}


                    {/* =========================================
                        COLUMN VISIBILITY
                    ========================================= */}

                    {featureConfig.columnVisibility && (

                        <DropdownMenu>

                            <DropdownMenuTrigger
                                render={
                                    <Button
                                        variant="outline"
                                    >
                                        Columns
                                    </Button>
                                }
                            />


                            <DropdownMenuContent
                                align="end"
                            >

                                {table
                                    .getAllColumns()
                                    .filter(
                                        (column) =>
                                            typeof column.accessorFn !==
                                            "undefined" &&
                                            column.getCanHide()
                                    )
                                    .map(
                                        (column) => (

                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                className="capitalize"
                                                checked={
                                                    column.getIsVisible()
                                                }
                                                onCheckedChange={
                                                    (value) =>
                                                        column.toggleVisibility(
                                                            !!value
                                                        )
                                                }
                                            >
                                                {column.id}
                                            </DropdownMenuCheckboxItem>

                                        )
                                    )}

                            </DropdownMenuContent>

                        </DropdownMenu>

                    )}

                </div>

            </div>


            {/* =================================================
                TABLE
            ================================================= */}

            <div className="overflow-hidden rounded-md border w-full">

                <Table>

                    <TableHeader>

                        {table
                            .getHeaderGroups()
                            .map(
                                (headerGroup) => (

                                    <TableRow
                                        key={
                                            headerGroup.id
                                        }
                                    >

                                        {headerGroup.headers.map(
                                            (header) => (

                                                <TableHead
                                                    key={
                                                        header.id
                                                    }
                                                >

                                                    {header.isPlaceholder
                                                        ? null
                                                        : (

                                                            <table.FlexRender
                                                                header={
                                                                    header
                                                                }
                                                            />

                                                        )}

                                                </TableHead>

                                            )
                                        )}

                                    </TableRow>

                                )
                            )}

                    </TableHeader>


                    <TableBody>

                        {table
                            .getRowModel()
                            .rows?.length ? (

                            table
                                .getRowModel()
                                .rows
                                .map(
                                    (row) => (

                                        <TableRow
                                            key={
                                                row.id
                                            }

                                            data-state={
                                                row.getIsSelected()
                                                    ? "selected"
                                                    : undefined
                                            }
                                        >

                                            {row
                                                .getVisibleCells()
                                                .map(
                                                    (cell) => (

                                                        <TableCell
                                                            key={
                                                                cell.id
                                                            }
                                                        >

                                                            <table.FlexRender
                                                                cell={
                                                                    cell
                                                                }
                                                            />

                                                        </TableCell>

                                                    )
                                                )}

                                        </TableRow>

                                    )
                                )

                        ) : (

                            <TableRow>

                                <TableCell
                                    colSpan={
                                        columns.length
                                    }
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>

                            </TableRow>

                        )}

                    </TableBody>

                </Table>


                {/* =================================================
                    PAGINATION
                ================================================= */}

                {featureConfig.pagination && (

                    <div className="flex items-center justify-between px-2 py-4">

                        <div className="flex-1 text-sm text-muted-foreground">

                            {selectedCount}

                            {" "}of{" "}

                            {
                                table
                                    .getFilteredRowModel()
                                    .rows.length
                            }

                            {" "}row(s) selected.

                        </div>


                        <div className="flex items-center space-x-6 lg:space-x-8">

                            <div className="flex items-center space-x-2">

                                <p className="text-sm font-medium">
                                    Rows per page
                                </p>


                                <Select
                                    value={
                                        `${table.state.pagination.pageSize}`
                                    }
                                    onValueChange={
                                        (value) =>
                                            table.setPageSize(
                                                Number(value)
                                            )
                                    }
                                >

                                    <SelectTrigger
                                        className="h-8 w-17.5"
                                    >

                                        <SelectValue
                                            placeholder={
                                                table
                                                    .state
                                                    .pagination
                                                    .pageSize
                                            }
                                        />

                                    </SelectTrigger>


                                    <SelectContent
                                        side="top"
                                    >

                                        {[
                                            10,
                                            20,
                                            25,
                                            30,
                                            40,
                                            50,
                                        ].map(
                                            (pageSize) => (

                                                <SelectItem
                                                    key={
                                                        pageSize
                                                    }
                                                    value={
                                                        `${pageSize}`
                                                    }
                                                >
                                                    {pageSize}
                                                </SelectItem>

                                            )
                                        )}

                                    </SelectContent>

                                </Select>

                            </div>


                            <div className="flex w-25 items-center justify-center text-sm font-medium">

                                Page{" "}

                                {
                                    table
                                        .state
                                        .pagination
                                        .pageIndex + 1
                                }

                                {" "}of{" "}

                                {
                                    table.getPageCount()
                                }

                            </div>


                            <div className="flex items-center space-x-2">

                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="hidden size-8 lg:flex"
                                    onClick={() =>
                                        table.setPageIndex(
                                            0
                                        )
                                    }
                                    disabled={
                                        !table.getCanPreviousPage()
                                    }
                                >
                                    <span className="sr-only">
                                        Go to first page
                                    </span>

                                    <ChevronsLeft />
                                </Button>


                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-8"
                                    onClick={() =>
                                        table.previousPage()
                                    }
                                    disabled={
                                        !table.getCanPreviousPage()
                                    }
                                >
                                    <span className="sr-only">
                                        Go to previous page
                                    </span>

                                    <ChevronLeft />
                                </Button>


                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-8"
                                    onClick={() =>
                                        table.nextPage()
                                    }
                                    disabled={
                                        !table.getCanNextPage()
                                    }
                                >
                                    <span className="sr-only">
                                        Go to next page
                                    </span>

                                    <ChevronRight />
                                </Button>


                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="hidden size-8 lg:flex"
                                    onClick={() =>
                                        table.setPageIndex(
                                            table.getPageCount() - 1
                                        )
                                    }
                                    disabled={
                                        !table.getCanNextPage()
                                    }
                                >
                                    <span className="sr-only">
                                        Go to last page
                                    </span>

                                    <ChevronsRight />
                                </Button>

                            </div>

                        </div>

                    </div>

                )}

            </div>


            {/* =================================================
                CREATE DIALOG
            ================================================= */}

            <Dialog
                open={
                    createDialogOpen
                }
                onOpenChange={
                    setCreateDialogOpen
                }
            >

                <DialogContent
                    className="sm:max-w-lg"
                >

                    <DialogHeader>

                        <DialogTitle>
                            Create
                        </DialogTitle>

                        <DialogDescription>
                            Create a new record.
                        </DialogDescription>

                    </DialogHeader>


                    {createForm && (

                        <React.Fragment
                            key={
                                createFormKey
                            }
                        >

                            {createForm({
                                onSuccess:
                                    handleCreateSuccess,
                            })}

                        </React.Fragment>

                    )}

                </DialogContent>

            </Dialog>


            {/* =================================================
                EDIT DIALOG
            ================================================= */}

            <Dialog
                open={
                    editDialogOpen
                }
                onOpenChange={
                    (open) => {

                        setEditDialogOpen(
                            open
                        )

                        if (!open) {

                            setEditingRow(
                                null
                            )

                        }

                    }
                }
            >

                <DialogContent
                    className="sm:max-w-lg"
                >

                    <DialogHeader>

                        <DialogTitle>
                            Edit
                        </DialogTitle>

                        <DialogDescription>
                            Update the selected record.
                        </DialogDescription>

                    </DialogHeader>


                    {editingRow &&
                        editForm && (

                            <React.Fragment
                                key={
                                    editFormKey
                                }
                            >

                                {editForm({
                                    row: editingRow,

                                    onSuccess:
                                        handleEditSuccess,
                                })}

                            </React.Fragment>

                        )}

                </DialogContent>

            </Dialog>

        </>

    )
}