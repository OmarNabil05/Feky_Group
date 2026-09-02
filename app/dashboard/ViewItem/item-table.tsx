
"use client"

import DataTable from "@/components/ui/data-table"
import Form from "@/components/ReadyLayouts/Form"

import {
    deleteItemAction,
    updateItemAction,
} from "@/actions/items.action"

import {
    ColumnsKeys,
    type ItemsSchema,
} from "@/types/items.types"

import {
    ItemSchema,
} from "@/validations/items.validation"

import {
    ItemFields,
} from "@/Fields/items.fields"


type ItemsTableProps = {
    data: ItemsSchema[]
}


export default function ItemsTable({
    data,
}: ItemsTableProps) {

    return (
        <DataTable<ItemsSchema>
            ColumnHeaders={ColumnsKeys}
            data={data}

            features={{
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
            }}

            getRowId={(item) =>
                item.CardCode!
            }

            editForm={({ row, onSuccess }) => (
                <Form
                    mode="edit"

                    editData={row}

                    schema={ItemSchema}

                    fields={ItemFields}

                    defaultValues={{
                        ProductName:
                            row.ProductName,

                        MinLimit:
                            row.MinLimit,

                        MaxLimit:
                            row.MaxLimit,

                        Source:
                            row.Source,

                        Specification:
                            row.Specification,

                        Width:
                            row.Width,

                        Hieght:
                            row.Hieght,
                    }}

                    onEditSubmit={async (
                        formData,
                        editData
                    ) => {

                        return updateItemAction({
                            cardCode:
                                editData.CardCode!,

                            item:
                                formData,
                        })
                    }}

                    onEditSuccess={
                        onSuccess
                    }

                    variant="plain"

                    submitText="Update"
                />
            )}

            onDelete={(item) =>
                deleteItemAction(
                    item.CardCode!
                )
            }
        />
    )
}

