
"use server";

import {
    createItem,
    getAllItems,
    getAnItemByCardCode,
    searchForItems,
    UpdateAnItem,
    deleteAnItem,
    itemNameFound,
    getNumberOfItems,
    getSearchItemsCount,
    getTheItemChanges,
} from "@/services/items.service";

import { withErrorHandler } from "@/utils/witherrorhandler";

// Create
export async function createItemAction(data: unknown) {
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
    data: {
        cardGuide: string;
        item: unknown;
    }
) {
    return withErrorHandler(() =>
        UpdateAnItem(
            data.cardGuide,
            data.item
        )
    );
}

// Delete
export async function deleteItemAction(
    cardGuide: string
) {
    return withErrorHandler(() =>
        deleteAnItem(cardGuide)
    );
}

// Check if product name already exists
export async function itemFoundBefore(
    productName: string
) {
    return withErrorHandler(() =>
        itemNameFound(productName)
    );
}

// Number of items
export async function GetItemsNumbers() {
    return withErrorHandler(() =>
        getNumberOfItems()
    );
}

// Search items count
export async function GetSearchItemsNumbers(
    search: string
) {
    return withErrorHandler(() =>
        getSearchItemsCount(search)
    );
}

// Change Tracking
export async function GetItemChanges(
    lastVersion: number
) {
    return withErrorHandler(() =>
        getTheItemChanges(lastVersion)
    );
}

