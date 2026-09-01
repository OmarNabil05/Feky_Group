import { getItemsAction } from "@/actions/items.action";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { toast } from "@/components/ui/toast";




export default async function ItemsPage() {
    const result = await getItemsAction(0, 20);

    return (
        <div className="container mx-auto">
            <DataTable
                columns={columns}
                data={result.success ? result.data : []}
            />
        </div>
    );
}