
"use client";

import {
    FormProvider,
    useForm,
} from "react-hook-form";

import Selects from "./selects";
import StaticFields from "./staticFields";
import Body from "./body";

import type {
    DateSelectorValue,
} from "@/components/ui/date-selector";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


import {
    createContractAction,
    updateContractAction,
} from "@/actions/contracts.action";

export type ContractFormData = {
    contractName: string;

    agent: string;
    currency: string;
    warehouse: string;

    date: DateSelectorValue;
    notes: string;

    products: {
        cardGuide: string;
        productName: string;
        date: DateSelectorValue;
        quantity: number;
        price: number;
    }[];
};

export type ContractMode = "create" | "edit" | "view";

type Item = {
    CardGuide: string;
    CardCode: string;
    ProductName: string;
};

type Agent = {
    CardGuide: string;
    AgentName: string;
};

type Currency = {
    CardGuide: string;
    CurrencyName: string;
};

type Warehouse = {
    CardGuide: string;
    WarehouseName: string;
};

type ContractFormProps = {
    mode: ContractMode;

    Agents: Agent[];
    Currency: Currency[];
    WareHouses: Warehouse[];

    items: Item[];

    initialData?: Partial<ContractFormData>;

    cardGuide?: string;
};

export default function ContractForm({
    mode,
    Agents,
    Currency,
    WareHouses,
    items,
    initialData,
    cardGuide,
}: ContractFormProps) {

    const isView = mode === "view";

    const form = useForm<ContractFormData>({
        defaultValues: {
            contractName: "",

            agent: "",
            currency: "",
            warehouse: "",

            date: {
                period: "day",
                operator: "is",
                startDate: new Date(),
            },

            notes: "",

            products: [
                {
                    cardGuide: "",
                    productName: "",

                    date: {
                        period: "day",
                        operator: "is",
                        startDate: new Date(),
                    },

                    quantity: 1,
                    price: 0,
                },
            ],

            ...initialData,
        },
    });

    async function handleSubmit(data: ContractFormData) {

        if (mode === "view") {
            return;
        }

        console.log("FORM DATA");
        console.log(data);

        /*
        |--------------------------------------------------------------------------
        | CREATE
        |--------------------------------------------------------------------------
        */

        if (mode === "create") {

            if (!data.date.startDate) {
                console.error("Contract date is required");
                return;
            }

            for (const product of data.products) {
                if (!product.date.startDate) {
                    console.error("Delivery date is required");
                    return;
                }
            }

            const contractData = {
                AgentGuide01: data.agent,
                Currency: data.currency,
                StoreID: data.warehouse,
                CardDate: data.date.startDate,

                // NEW
                ArcheiveName: data.contractName,

                Notes: data.notes,

                Products: data.products.map((product) => ({
                    ItemGuide: product.cardGuide,
                    Quantity: product.quantity,
                    Price: product.price,
                    DeliveryDate: product.date.startDate!,
                })),
            };

            console.log("CONTRACT DATA");
            console.log(contractData);

            const result = await createContractAction(contractData);

            console.log("CREATE RESULT");
            console.log(result);

            if (!result.success) {
                console.error("Failed to create contract");
                return;
            }

            console.log("Contract created successfully");

            form.reset();

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | EDIT
        |--------------------------------------------------------------------------
        */

        if (mode === "edit") {

            if (!cardGuide) {
                console.error("Contract CardGuide is required for edit");
                return;
            }

            if (!data.date.startDate) {
                console.error("Contract date is required");
                return;
            }

            for (const product of data.products) {
                if (!product.date.startDate) {
                    console.error("Delivery date is required");
                    return;
                }
            }

            const contractData = {
                AgentGuide01: data.agent,
                Currency: data.currency,
                StoreID: data.warehouse,
                CardDate: data.date.startDate,

                // NEW
                ArcheiveName: data.contractName,

                Notes: data.notes,

                Products: data.products.map((product) => ({
                    ItemGuide: product.cardGuide,
                    Quantity: product.quantity,
                    Price: product.price,
                    DeliveryDate: product.date.startDate!,
                })),
            };

            console.log("UPDATE CONTRACT DATA");
            console.log(contractData);

            const result = await updateContractAction(
                cardGuide,
                contractData
            );

            console.log("UPDATE RESULT");
            console.log(result);

            if (!result.success) {
                console.error("Failed to update contract");
                return;
            }

            console.log("Contract updated successfully");

            return;
        }
    }

    return (
        <FormProvider {...form}>

            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex flex-col gap-4"
            >

                <div className="flex flex-col gap-4">

                    {/* Contract Name - FIRST INPUT */}
                    <div className="flex flex-col gap-2">


                        <Input
                            id="contractName"
                            placeholder="Enter contract name"
                            disabled={isView}
                            {...form.register("contractName")}
                        />
                    </div>

                    <Selects
                        Agents={Agents}
                        Currency={Currency}
                        WareHouses={WareHouses}
                        disabled={isView}
                    />

                    <StaticFields
                        disabled={isView}
                    />

                </div>

                <Body
                    items={items}
                    disabled={isView}
                />

                {!isView && (
                    <div className="flex justify-end">

                        <Button
                            type="submit"
                            className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
                        >
                            {mode === "edit"
                                ? "Update Contract"
                                : "Create Contract"}
                        </Button>

                    </div>
                )}

            </form>

        </FormProvider>
    );
}

