
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

    searchParams: Promise<{
        mode?: string;
    }>;
};

function formatDateForInput(date: Date) {
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export default async function EditContractPage({
    params,
    searchParams,
}: PageProps) {

    const { id } = await params;

    const { mode } = await searchParams;


    // --------------------------------
    // Determine form mode
    // --------------------------------

    const formMode =
        mode === "view"
            ? "view"
            : "edit";


    // --------------------------------
    // Load basic data
    // --------------------------------

    const agents =
        await GETAgents();

    const currency =
        await GETCurrency();

    const warehouses =
        await GETWarehouses();

    const items =
        await getItemsAction(
            0,
            10000
        );


    // --------------------------------
    // Get contract
    // --------------------------------

    const contract =
        await getContractAction(id);


    // --------------------------------
    // Handle contract loading error
    // --------------------------------

    if (!contract.success) {

        console.log(
            "CONTRACT ERROR:",
            contract
        );

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

        console.log(
            "CONTRACT DATA IS EMPTY:",
            contract
        );

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

        console.log(
            "BASIC DATA ERROR:",
            {
                agents: agents.success,
                currency: currency.success,
                warehouses: warehouses.success,
                items: items.success,
            }
        );

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

        contractName:
            contract.data.ArcheiveName,

        agent:
            contract.data.AgentGuide01,

        currency:
            contract.data.Currency,

        warehouse:
            contract.data.StoreID,

        date:
            formatDateForInput(
                contract.data.CardDate
            ),

        notes:
            contract.data.Notes ?? "",

        products:
            contract.data.Products.map(
                (product) => ({

                    // TBL093.ItemGuide
                    // is the product ID.

                    cardGuide:
                        product.ItemGuide,

                    // Get product name
                    // from the items list.

                    productName:
                        items.data?.find(
                            (item) =>
                                item.CardGuide ===
                                product.ItemGuide
                        )?.ProductName ?? "",

                    // Convert Date → YYYY-MM-DD

                    date:
                        formatDateForInput(
                            product.DeliveryDate
                        ),

                    quantity:
                        product.Quantity,

                    price:
                        product.Price,

                    // TBL093.Delivered
                    //
                    // 0 = Not Delivered
                    // 1 = Delivered

                    delivered:
                        product.Delivered,
                })
            ),
    };


    // --------------------------------
    // Render form
    // --------------------------------

    return (
        <ContractForm

            mode={formMode}

            Agents={
                agents.data ?? []
            }

            Currency={
                currency.data ?? []
            }

            WareHouses={
                warehouses.data ?? []
            }

            items={
                items.data ?? []
            }

            initialData={
                initialData
            }

            cardGuide={
                contract.data.CardGuide
            }

            // TBL085.Status
            //
            // 0 = In Progress
            // 1 = Finished

            status={
                contract.data.Status
            }

        />
    );
}

