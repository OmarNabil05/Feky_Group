"use client";

import Form from "@/components/ReadyLayouts/Form";
import {
    createItemAction,
    deleteItemAction,
} from "@/actions/items.action";

export default function AddItemPage() {

    return (
        <Form
            title="Add Item"
            submitText="Add Item"
            loadingText="Adding..."
            onSubmit={createItemAction}
            onDelete={(item) =>
                deleteItemAction(item)
            }
        />
    );
}