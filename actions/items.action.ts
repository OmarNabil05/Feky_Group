"use server";

import {
    createItem,
    getAllItems,
    getAnItemByCardCode,
    searchForItems,
    UpdateAnItem,
    deleteAnItem,
    itemNameFound

} from "@/services/items.service";

import { withErrorHandler } from "@/utils/witherrorhandler";


// Create
export async function createItemAction(data: unknown) {
    console.log("CREATE ITEM DATA:", data);
    return withErrorHandler(() =>
        createItem(data)
    );
}


// Get all
export async function getItemsAction(
    offset: number,
    limit: number
) {
    return withErrorHandler(() =>
        getAllItems(offset, limit)
    );
}


// Get one by CardCode
export async function getItemAction(cardCode: string) {
    return withErrorHandler(() =>
        getAnItemByCardCode(cardCode)
    );
}


// Search
export async function searchItemsAction(
    search: string,
    limit: number,
    offset: number
) {
    return withErrorHandler(() =>
        searchForItems(search, limit, offset)
    );
}


// Update
export async function updateItemAction(
    cardCode: string,
    data: unknown
) {
    return withErrorHandler(() =>
        UpdateAnItem(cardCode, data)
    );
}


// Delete
export async function deleteItemAction(
    cardCode: string
) {
    return withErrorHandler(() =>
        deleteAnItem(cardCode)
    );
}

// Found 3ndk ? 
export async function itemFoundBefore(
    productName: string
) {
    return withErrorHandler(() =>
        itemNameFound(productName)
    );
}