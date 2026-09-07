
import Selects from "./selects";

import {
    GETAgents,
    GETCurrency,
    GETWarehouses,
} from "@/actions/BasicFunctions/Basic-function";
import StaticFields from "./staticFields";
import { Card, CardHeader } from "@/components/ui/card";

export default async function ContractsPage() {
    const agents = await GETAgents();
    const currency = await GETCurrency();
    const warehouses = await GETWarehouses();

    if (
        !agents.success ||
        !currency.success ||
        !warehouses.success
    ) {
        return (
            <div className="container mx-auto py-10">
                <p className="text-destructive">
                    Failed to load basic data.
                </p>
            </div>
        );
    }

    return (<div className="flex flex-col justify-center">

        <Card className=" p-2">

            <Selects
                Agents={agents.data ?? []}
                Currency={currency.data ?? []}
                WareHouses={warehouses.data ?? []}
            />
            <StaticFields />
        </Card>
    </div>
    );
}

