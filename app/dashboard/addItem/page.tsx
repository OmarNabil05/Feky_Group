"use client";

import Form from "@/components/ReadyLayouts/Form";
import { createItemAction } from "@/actions/items.action";

export default function AddItemPage() {

    async function handleCreateItem(data: any) {

        const result = await createItemAction(data);

        if (!result.success) {
            // toast here
            return;
        }

        // success dialog here
    }

    return (
        <Form
            title="Add Item"
            submitText="Add Item"
            loadingText="Adding..."
            onSubmit={handleCreateItem}
        />
    );
}