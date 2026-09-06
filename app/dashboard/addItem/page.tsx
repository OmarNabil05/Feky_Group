
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
             *
             * CardGuide is the actual database ID.
             */
            getDeleteData={(item) =>
                item.CardGuide
            }

            onDelete={deleteItemAction}


            /*
             * UPDATE DATA
             *
             * Form will create:
             *
             * {
             *     cardGuide: item.CardGuide,
             *     item: formData
             * }
             */
            getUpdateData={(item, formData) => ({
                cardGuide: item.CardGuide,
                item: formData,
            })}


            /*
             * UPDATE
             */
            onUpdate={updateItemAction}
        />
    );
}

