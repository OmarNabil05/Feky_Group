"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Check, Truck } from "lucide-react";

import type { Contract } from "@/types/contracts.types";

type ProductSchedule = {
    productName: string;
    date: string;
    quantity: number;
    status: 0 | 1;
};

type ContractSchedule = {
    contractId: string;
    agent: string;
    currency: string;
    warehouse: string;
    date: string;
    notes: string;
    products: ProductSchedule[];
};

type ScheduleContractClientProps = {
    contract: Contract;
};

export default function ScheduleContractClient({
    contract: contractData,
}: ScheduleContractClientProps) {

    const scheduleData: ContractSchedule = {
        contractId: contractData.CardGuide,

        agent: contractData.AgentName,

        currency: contractData.CurrencyName,

        warehouse: contractData.WarehouseName,

        date: contractData.CardDate
            ? new Date(
                contractData.CardDate
            ).toLocaleDateString()
            : "",

        notes: contractData.Notes ?? "",

        products: contractData.Products.map(
            (product) => ({
                productName: product.ItemGuide,

                date: product.DeliveryDate
                    ? new Date(
                        product.DeliveryDate
                    ).toLocaleDateString()
                    : "",

                quantity: product.Quantity,

                status: product.Delivered
                    ? 1
                    : 0,
            })
        ),
    };

    const [contract, setContract] =
        useState<ContractSchedule>(scheduleData);

    function handleProductDeliver(
        productIndex: number
    ) {
        setContract((prev) => ({
            ...prev,

            products: prev.products.map(
                (product, index) =>
                    index === productIndex
                        ? {
                            ...product,
                            status: 1,
                        }
                        : product
            ),
        }));
    }

    const contractFields = [
        {
            label: "Agent",
            value: contract.agent,
        },
        {
            label: "Currency",
            value: contract.currency,
        },
        {
            label: "Warehouse",
            value: contract.warehouse,
        },
        {
            label: "Contract Date",
            value: contract.date,
        },
        {
            label: "Notes",
            value: contract.notes,
        },
    ];

    const productFields = [
        {
            label: "Product",
            key: "productName",
        },
        {
            label: "Delivery Date",
            key: "date",
        },
        {
            label: "Quantity",
            key: "quantity",
        },
    ] as const;

    return (
        <div className="container mx-auto max-w-4xl py-10">

            {/* Header */}

            <div className="mb-8">

                <h1 className="text-2xl font-semibold">
                    Schedule Contract
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    Contract #{contract.contractId}
                </p>

            </div>


            {/* Contract Information */}

            <div className="rounded-lg border bg-card p-6">

                <h2 className="mb-6 text-lg font-semibold">
                    Contract Information
                </h2>

                <div className="space-y-5">

                    {contractFields.map((field) => (
                        <div key={field.label}>

                            <p className="text-sm text-muted-foreground">
                                {field.label}
                            </p>

                            <p className="mt-1 font-medium">
                                {field.value}
                            </p>

                        </div>
                    ))}

                </div>

            </div>


            {/* Products */}

            <div className="mt-8">

                <h2 className="mb-4 text-lg font-semibold">
                    Products
                </h2>

                <div className="space-y-4">

                    {contract.products.map(
                        (product, index) => {

                            const delivered =
                                product.status === 1;

                            return (
                                <div
                                    key={index}
                                    className="rounded-lg border bg-card p-6"
                                >

                                    <div className="mb-6 flex items-center justify-between">

                                        <h3 className="font-semibold">
                                            Product {index + 1}
                                        </h3>

                                        <Badge
                                            className={
                                                delivered
                                                    ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                                                    : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                                            }
                                        >
                                            {delivered
                                                ? "Delivered"
                                                : "Pending"}
                                        </Badge>

                                    </div>


                                    <div className="grid gap-5 sm:grid-cols-3">

                                        {productFields.map(
                                            (field) => (
                                                <div
                                                    key={field.key}
                                                >

                                                    <p className="text-sm text-muted-foreground">
                                                        {field.label}
                                                    </p>

                                                    <p className="mt-1 font-medium">
                                                        {
                                                            product[
                                                            field.key
                                                            ]
                                                        }
                                                    </p>

                                                </div>
                                            )
                                        )}

                                    </div>


                                    <div className="mt-6 flex justify-end">

                                        <Button
                                            type="button"
                                            disabled={delivered}
                                            onClick={() =>
                                                handleProductDeliver(
                                                    index
                                                )
                                            }
                                        >

                                            {delivered ? (
                                                <>
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Delivered
                                                </>
                                            ) : (
                                                <>
                                                    <Truck className="mr-2 h-4 w-4" />
                                                    Deliver
                                                </>
                                            )}

                                        </Button>

                                    </div>

                                </div>
                            );
                        }
                    )}

                </div>

            </div>

        </div>
    );
}