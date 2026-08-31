
"use client";

import Form from "@/components/ReadyLayouts/Form";

import {
    createItemAction,
    deleteItemAction,
    updateItemAction,
} from "@/actions/items.action";

import {
    ItemSchema,
} from "@/validations/items.validation";

import {
    ItemFields,
} from "@/Fields/items.fields";


export default function AddItemPage() {

    return (
        <Form
            schema={ItemSchema}

            fields={ItemFields}


            /*
             * CREATE
             */
            onSubmit={createItemAction}


            /*
             * DELETE
             */
            getDeleteData={(item) =>
                item.CardCode
            }

            onDelete={deleteItemAction}


            /*
             * UPDATE DATA
             *
             * Form will create:
             *
             * {
             *     cardCode: item.CardCode,
             *     item: formData
             * }
             */
            getUpdateData={(item, formData) => ({
                cardCode: item.CardCode,
                item: formData,
            })}


            /*
             * UPDATE
             *
             * Receives ONE object.
             */
            onUpdate={updateItemAction}
        />
    );
}

