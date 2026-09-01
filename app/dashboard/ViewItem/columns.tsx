"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { ItemsSchema } from "@/types/items.types";
import { type DataTableFeatures } from "./data-table-features";
import { Checkbox } from "@/components/ui/checkbox";
import {
    PencilIcon,
    ShareIcon,
    TrashIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const columnHelper =
    createColumnHelper<DataTableFeatures, ItemsSchema>();

export const columns = (
    onEdit: (item: ItemsSchema) => void,
    onDelete: (item: ItemsSchema) => void,
) =>
    columnHelper.columns([
        // -------------------------
        // Row Selection
        // -------------------------
        columnHelper.display({
            id: "select",

            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllRowsSelected()}
                    onCheckedChange={(value) => {
                        table.toggleAllRowsSelected(!!value);
                    }}
                    aria-label="Select all"
                />
            ),

            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => {
                        row.toggleSelected(!!value);
                    }}
                    aria-label="Select row"
                />
            ),
        }),

        // -------------------------
        // Item Columns
        // -------------------------
        columnHelper.accessor("CardCode", {
            header: "Card Code",
        }),

        columnHelper.accessor("ProductName", {
            header: "Product Name",
        }),

        columnHelper.accessor("MinLimit", {
            header: "Min Limit",
        }),

        columnHelper.accessor("MaxLimit", {
            header: "Max Limit",
        }),

        columnHelper.accessor("Source", {
            header: "Source",
        }),

        columnHelper.accessor("Specification", {
            header: "Specification",
        }),

        columnHelper.accessor("Width", {
            header: "Width",
        }),

        columnHelper.accessor("Hieght", {
            header: "Height",
        }),

        // -------------------------
        // Actions
        // -------------------------
        columnHelper.display({
            id: "actions",
            header: "Actions",

            cell: ({ row }) => {
                const item = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button variant="ghost">
                                    ...
                                </Button>
                            }
                        />

                        <DropdownMenuContent align="end">
                            <DropdownMenuGroup>

                                <DropdownMenuItem
                                    onClick={() => onEdit(item)}
                                >
                                    <PencilIcon />
                                    Edit
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onClick={() => {
                                        console.log("copy", item);
                                    }}
                                >
                                    <ShareIcon />
                                    Copy
                                </DropdownMenuItem>

                            </DropdownMenuGroup>

                            <DropdownMenuSeparator />

                            <DropdownMenuGroup>

                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => onDelete(item)}
                                >
                                    <TrashIcon />
                                    Delete
                                </DropdownMenuItem>

                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        }),
    ]);