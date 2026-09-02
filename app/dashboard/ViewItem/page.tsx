
import { getItemsAction } from "@/actions/items.action";
import ItemsTable from "./item-table";

export default async function ViewItemPage() {

    const result = await getItemsAction(0, 22);

    if (!result.success) {
        return (
            <div className="container mx-auto py-10">
                <p className="text-destructive">
                    {result.message ?? "Failed to load items."}
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <ItemsTable data={result.data ?? []} />
        </div>
    );
}

