"use client";

import { useRouter } from "next/navigation";
import { useTable, type ColumnDef, type RowData } from "@tanstack/react-table";
import { toast } from "@/components/ui/toast";

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover"


import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    features,
    type DataTableFeatures,
} from "./data-table-features";

import {
    deleteItemAction,
    updateItemAction,
} from "@/actions/items.action";
import { Toast } from "@/components/ui/toast";

interface DataTableProps<TData extends RowData> {
    columns: (
        onEdit: (item: TData) => void,
        onDelete: (item: TData) => void
    ) => ColumnDef<DataTableFeatures, TData>[];

    data: TData[];
}

export function DataTable<TData extends RowData>({
    columns,
    data,
}: DataTableProps<TData>) {
    const router = useRouter();

    // -------------------------
    // Edit
    // -------------------------
    const handleEdit = (item: TData) => {


        const itemData = item as {
            CardCode?: string;
        };
        console.log(itemData.CardCode);

        return (<>
            <Popover>
                <PopoverTrigger render={<Button variant="outline">Open Popover</Button>} />
                <PopoverContent className="w-64" align="start">
                    <PopoverHeader>
                        <PopoverTitle>Dimensions</PopoverTitle>
                        <PopoverDescription>
                            Set the dimensions for the layer.
                        </PopoverDescription>
                    </PopoverHeader>
                    <FieldGroup className="gap-4">
                        <Field orientation="horizontal">
                            <FieldLabel htmlFor="width" className="w-1/2">
                                Width
                            </FieldLabel>
                            <Input id="width" defaultValue="100%" />
                        </Field>
                        <Field orientation="horizontal">
                            <FieldLabel htmlFor="height" className="w-1/2">
                                Height
                            </FieldLabel>
                            <Input id="height" defaultValue="25px" />
                        </Field>
                    </FieldGroup>
                </PopoverContent>
            </Popover>
        </>
        )

        // We will open your edit form here.
    };

    // -------------------------
    // Delete
    // -------------------------
    const handleDelete = async (item: TData) => {
        // ItemsSchema has CardCode
        const itemData = item as {
            CardCode?: string;
        };

        if (!itemData.CardCode) {

            toast.add({
                type: "error",
                title: "Error",
                description:

                    "No CardGuide.",
            });
            return;
        }

        const result = await deleteItemAction(
            itemData.CardCode
        );

        if (!result.success) {



            toast.add({
                type: "error",
                title: "Error",
                description:
                    result.message ??
                    "Failed to delete.",
            });
            return;
        }


        toast.add({
            type: "success",
            title: "Success",
            description:

                "successful deletion.",
        });

        // Re-fetch Server Component data
        router.refresh();
    };

    const tableColumns = columns(
        handleEdit,
        handleDelete
    );

    const table = useTable({
        features,
        data,
        columns: tableColumns,
    });

    return (
        <div className="overflow-hidden rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : (
                                            <table.FlexRender
                                                header={header}
                                            />
                                        )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>

                <TableBody>
                    {table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={
                                    row.getIsSelected()
                                        ? "selected"
                                        : undefined
                                }
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        <table.FlexRender
                                            cell={cell}
                                        />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={tableColumns.length}
                                className="h-24 text-center"
                            >
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}