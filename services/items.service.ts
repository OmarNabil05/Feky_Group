// items.service.ts

import {
    insertItem,
    getItems,
    getItemByCardCode,
    searchItems,
    updateItem,
    deleteItem,
} from "@/repository/items.repository";

import { ItemSchema } from "@/validations/items.validation";

export async function createItem(item: unknown) {

    const ValidatedItem = ItemSchema.parse(item);

    const itemCreated = await insertItem(ValidatedItem);

    return itemCreated;
}



