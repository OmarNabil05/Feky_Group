"use client"

import { createColumnHelper } from "@tanstack/react-table"

import { type DataTableFeatures } from "./data-table-features"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
import { ItemsSchema } from "@/types/items.types"

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

// export interface ItemsSchema {
//     ProductName: string;
//     MinLimit?: number;
//     MaxLimit?: number;
//     Source?: string;
//     Specification?: string;
//     Width?: number;
//     Hieght?: number;
//     CardImage?: Buffer | null;
//     CardCode?: string;
// }

// Use `accessor` for data columns and `display` for columns without one.
const columnHelper = createColumnHelper<DataTableFeatures, ItemsSchema>()

export const columns = columnHelper.columns([

    columnHelper.accessor("CardCode", {
        header: "CardCode",
    }),
    columnHelper.accessor("ProductName", {
        header: "Product Name",
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
        header: "Hieght",
    }),
    columnHelper.accessor("MinLimit", {
        header: "MinLimit",
    }),
    columnHelper.accessor("MaxLimit", {
        header: "MaxLimit",
    }),
    columnHelper.display({
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
    }),

])