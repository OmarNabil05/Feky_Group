

import DataTable from "@/components/ui/data-table"
import { getItemsAction } from "@/actions/items.action"
import { toast } from "@/components/ui/toast";
import { ColumnsKeys } from "@/types/items.types";





async function getData() {
    // Fetch data from your API here.
    const result = await getItemsAction(0, 22);

    if (!result.success) {
        toast.add({
            type: "error",
            title: "failed to fetch",
            description: result.message

        })
        return [];
    }

    // ...
    return result.data;


}

export default async function DemoPage() {
    const data = await getData()

    return (
        <div className="container mx-auto py-10">
            <DataTable ColumnHeaders={ColumnsKeys} data={data} actionsOn={true} />
        </div>
    )
}