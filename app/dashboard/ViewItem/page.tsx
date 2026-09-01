import {
    getItemsAction,
    searchItemsAction,
    GetItemsNumbers,
    GetSearchItemsNumbers,
    deleteItemAction,
} from "@/actions/items.action";

import { DataTable } from "@/components/ui/data-table";

const PAGE_SIZE = 10;

export default async function ItemsPage() {
    const [itemsResult, countResult] =
        await Promise.all([
            getItemsAction(0, PAGE_SIZE),
            GetItemsNumbers(),
        ]);

    if (!itemsResult.success) {
        return (
            <div className="container mx-auto">
                <p className="text-destructive">
                    {itemsResult.errors?.[0]?.message ??
                        "Failed to load items"}
                </p>
            </div>
        );
    }

    if (!countResult.success) {
        return (
            <div className="container mx-auto">
                <p className="text-destructive">
                    {countResult.errors?.[0]?.message ??
                        "Failed to load item count"}
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            <DataTable
                initialData={itemsResult.data}
                initialTotal={countResult.data}
                pageSize={PAGE_SIZE}
                fetchData={getItemsAction}
                searchData={searchItemsAction}
                getTotal={GetItemsNumbers}
                getSearchTotal={GetSearchItemsNumbers}
                onDelete={deleteItemAction}
            />
        </div>
    );
}