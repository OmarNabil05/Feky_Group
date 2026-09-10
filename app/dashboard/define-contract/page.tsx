import {
    GETAgents,
    GETCurrency,
    GETWarehouses,
} from "@/actions/BasicFunctions/Basic-function";

import { getItemsAction } from "@/actions/items.action";

import { Card } from "@/components/ui/card";

import ContractForm from "./contract-form";

export default async function ContractsPage() {

    const agents = await GETAgents();
    const currency = await GETCurrency();
    const warehouses = await GETWarehouses();

    const items = await getItemsAction(0, 10000);


    if (
        !agents.success ||
        !currency.success ||
        !warehouses.success ||
        !items.success
    ) {
        return (
            <Card className="container mx-auto py-10">
                <p className="text-destructive">
                    Failed to load basic data.
                </p>
            </Card>
        );
    }


    return (
        <ContractForm
            mode="create"

            Agents={agents.data ?? []}
            Currency={currency.data ?? []}
            WareHouses={warehouses.data ?? []}

            items={items.data ?? []}
        />
    );
}