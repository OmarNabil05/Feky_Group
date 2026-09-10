import {
    GETAgents,
    GETCurrency,
    GETWarehouses,
} from "@/actions/BasicFunctions/Basic-function";

import { getItemsAction } from "@/actions/items.action";
import { getContractAction } from "@/actions/contracts.action";

import ContractForm from "../contract-form";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditContractPage({
    params,
}: PageProps) {

    const { id } = await params;

    // --------------------------------
    // Load basic data
    // --------------------------------

    const agents = await GETAgents();
    const currency = await GETCurrency();
    const warehouses = await GETWarehouses();

    const items = await getItemsAction(0, 10000);

    // --------------------------------
    // Get contract
    // --------------------------------

    const contract = await getContractAction(id);

    // --------------------------------
    // Handle contract loading error
    // --------------------------------

    if (!contract.success) {
        console.log("EDIT CONTRACT ERROR:", contract);

        return (
            <div className="p-6">
                Failed to load contract data.
            </div>
        );
    }

    // --------------------------------
    // Make sure contract data exists
    // --------------------------------

    if (!contract.data) {
        console.log("EDIT CONTRACT DATA IS EMPTY:", contract);

        return (
            <div className="p-6">
                Contract data was not found.
            </div>
        );
    }

    // --------------------------------
    // Handle basic data loading errors
    // --------------------------------

    if (
        !agents.success ||
        !currency.success ||
        !warehouses.success ||
        !items.success
    ) {
        console.log("EDIT BASIC DATA ERROR:", {
            agents: agents.success,
            currency: currency.success,
            warehouses: warehouses.success,
            items: items.success,
        });

        return (
            <div className="p-6">
                Failed to load basic data.
            </div>
        );
    }

    // --------------------------------
    // Convert backend data → form data
    // --------------------------------

    const initialData = {
        contractName: contract.data.ArcheiveName,

        agent: contract.data.AgentGuide01,

        currency: contract.data.Currency,

        warehouse: contract.data.StoreID,

        date: {
            period: "day" as const,
            operator: "is" as const,
            startDate: contract.data.CardDate,
        },

        notes: contract.data.Notes ?? "",

        products: contract.data.Products.map((product) => ({
            cardGuide: product.CardGuide,

            productName:
                items.data?.find(
                    (item) =>
                        item.CardGuide === product.ItemGuide
                )?.ProductName ?? "",

            date: {
                period: "day" as const,
                operator: "is" as const,
                startDate: product.DeliveryDate,
            },

            quantity: product.Quantity,

            price: product.Price,
        })),
    };

    // --------------------------------
    // Render form
    // --------------------------------

    return (
        <ContractForm
            mode="edit"

            Agents={agents.data ?? []}

            Currency={currency.data ?? []}

            WareHouses={warehouses.data ?? []}

            items={items.data ?? []}

            initialData={initialData}

            cardGuide={contract.data.CardGuide}
        />
    );
}