// items.service.ts

import {
    insertItem,
    getItems,
    getItemByCardCode,
    searchItems,
    updateItem,
    deleteItem,
    itemNameExists,
} from "@/repository/items.repository";

import { AppError } from "@/utils/AppError";
import { LimitsValidation } from "@/utils/items.utils";
import { ItemSchema } from "@/validations/items.validation";


export async function createItem(item: unknown) {

    const ValidatedItem = ItemSchema.parse(item);

    LimitsValidation(ValidatedItem);

    const itemCreated = await insertItem(ValidatedItem);

    return itemCreated;
}


export async function getAllItems(offset: number, limit: number) {

    if (offset < 0 || limit <= 0) {
        throw new AppError("Invalid offset or limit values", 400);
    }

    const items = await getItems(offset, limit);

    return items;
}


export async function getAnItemByCardCode(cardCode: string) {

    if (!cardCode.trim()) {
        throw new AppError("The Card Code is empty", 400);
    }

    const item = await getItemByCardCode(cardCode);

    if (!item) {
        throw new AppError("Item not found", 404);
    }

    return item;
}


export async function searchForItems(
    search: string,
    limit: number,
    offset: number
) {

    if (!search.trim()) {
        throw new AppError("Search value is required", 400);
    }

    if (offset < 0 || limit <= 0) {
        throw new AppError("Invalid offset or limit values", 400);
    }

    const itemSearched = await searchItems(search, limit, offset);

    return itemSearched;
}


export async function UpdateAnItem(
    cardCode: string,
    item: unknown
) {

    if (!cardCode.trim()) {
        throw new AppError("The Card Code is empty", 400);
    }

    const ValidatedItem = ItemSchema.parse(item);

    LimitsValidation(ValidatedItem);

    const itemUpdated = await updateItem(cardCode, ValidatedItem);

    if (!itemUpdated) {
        throw new AppError("Item not found", 404);
    }

    return itemUpdated;
}


export async function deleteAnItem(cardCode: string) {

    if (!cardCode.trim()) {
        throw new AppError("The Card Code is empty", 400);
    }

    const itemDeleted = await deleteItem(cardCode);

    if (!itemDeleted) {
        throw new AppError("Item not found", 404);
    }

    return itemDeleted;
}


export async function itemNameFound(productName: string) {
    if (!productName.trim()) {
        throw new AppError("Product name is required", 400);
    }

    const isFound: boolean = await itemNameExists(productName);

    return isFound;
}