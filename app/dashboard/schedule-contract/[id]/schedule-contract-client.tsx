"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
    Check,
    Truck,
    Loader2,
} from "lucide-react";

import { toast } from "@/components/ui/toast";

import {
    deliverContractProductAction,
} from "@/actions/contracts.action";

import type {
    Contract,
} from "@/types/contracts.types";

// =========================================================
// TYPES
// =========================================================

type ScheduleProduct = {
    ID: number;


    ItemGuide: string;

    ProductName: string;

    Quantity: number;

    Price: number;

    DeliveryDate: Date;

    Delivered: boolean;


};

type ScheduleContractClientProps = {
    contract: Contract;


    schedule: ScheduleProduct[];


};

// =========================================================
// COMPONENT
// =========================================================

export default function ScheduleContractClient({
    contract: contractData,
    schedule,
}: ScheduleContractClientProps) {


    /* =========================
       STATE
    ========================= */

    const [products, setProducts] =
        useState<ScheduleProduct[]>(
            schedule
        );


    const [deliveringId, setDeliveringId] =
        useState<number | null>(null);


    /* =========================
       DELIVER PRODUCT
    ========================= */

    async function handleProductDeliver(
        productId: number
    ) {

        console.log(
            "DELIVER PRODUCT:",
            {
                contractGuide:
                    contractData.CardGuide,

                productId,
            }
        );


        setDeliveringId(productId);


        try {

            const result =
                await deliverContractProductAction(
                    contractData.CardGuide,
                    productId
                );


            console.log(
                "DELIVER RESULT:",
                result
            );


            if (!result.success) {

                toast.add({
                    title:
                        result.message ??
                        "Failed to deliver product",
                });

                return;
            }


            /* =========================
               UPDATE UI AFTER DB SUCCESS
            ========================= */

            setProducts((prev) =>
                prev.map((product) =>
                    product.ID === productId
                        ? {
                            ...product,
                            Delivered: true,
                        }
                        : product
                )
            );


            toast.add({
                title:
                    "Product delivered successfully",
            });


            if (result.data?.Finished) {

                toast.add({
                    title:
                        "All products are delivered. Contract finished!",
                });

            }

        } catch (error) {

            console.error(
                "[DELIVER PRODUCT ERROR]",
                error
            );


            toast.add({
                title:
                    "Failed to deliver product",
            });

        } finally {

            setDeliveringId(null);

        }
    }


    /* =========================
       CONTRACT FIELDS
    ========================= */

    const contractFields = [
        {
            label: "Contract Name",
            value: contractData.ArcheiveName,
        },

        {
            label: "Agent",
            value: contractData.AgentName,
        },

        {
            label: "Currency",
            value: contractData.CurrencyName,
        },

        {
            label: "Warehouse",
            value: contractData.WarehouseName,
        },

        {
            label: "Contract Date",
            value: contractData.CardDate
                ? new Date(
                    contractData.CardDate
                ).toLocaleDateString()
                : "",
        },

        {
            label: "Notes",
            value: contractData.Notes ?? "",
        },
    ];


    /* =========================
       PRODUCT FIELDS
    ========================= */

    const productFields = [
        {
            label: "Product",
            key: "ProductName",
        },

        {
            label: "Delivery Date",
            key: "DeliveryDate",
        },

        {
            label: "Quantity",
            key: "Quantity",
        },
    ] as const;


    /* =========================
       RENDER
    ========================= */

    return (

        <div className="container mx-auto max-w-4xl py-10">

            {/* =========================
            HEADER
        ========================= */}

            <div className="mb-8">

                <h1 className="text-2xl font-semibold">
                    Schedule Contract
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    Contract #{contractData.CardGuide}
                </p>

            </div>


            {/* =========================
            CONTRACT INFORMATION
        ========================= */}

            <div className="rounded-lg border bg-card p-6">

                <h2 className="mb-6 text-lg font-semibold">
                    Contract Information
                </h2>


                <div className="space-y-5">

                    {contractFields.map(
                        (field) => (

                            <div
                                key={field.label}
                            >

                                <p className="text-sm text-muted-foreground">
                                    {field.label}
                                </p>

                                <p className="mt-1 font-medium">
                                    {field.value}
                                </p>

                            </div>

                        )
                    )}

                </div>

            </div>


            {/* =========================
            PRODUCTS
        ========================= */}

            <div className="mt-8">

                <h2 className="mb-4 text-lg font-semibold">
                    Products
                </h2>


                <div className="space-y-4">

                    {products.map(
                        (product, index) => {

                            const delivered =
                                product.Delivered;


                            const isDelivering =
                                deliveringId === product.ID;


                            return (

                                <div
                                    key={product.ID}
                                    className="rounded-lg border bg-card p-6"
                                >

                                    {/* PRODUCT HEADER */}

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


                                    {/* PRODUCT INFORMATION */}

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

                                                        {field.key ===
                                                            "DeliveryDate"
                                                            ? product.DeliveryDate
                                                                ? new Date(
                                                                    product.DeliveryDate
                                                                ).toLocaleDateString()
                                                                : ""
                                                            : product[
                                                            field.key
                                                            ]}

                                                    </p>

                                                </div>

                                            )
                                        )}

                                    </div>


                                    {/* DELIVER BUTTON */}

                                    <div className="mt-6 flex justify-end">

                                        <Button
                                            type="button"

                                            disabled={
                                                delivered ||
                                                isDelivering
                                            }

                                            onClick={() =>
                                                handleProductDeliver(
                                                    product.ID
                                                )
                                            }
                                        >

                                            {isDelivering ? (

                                                <>

                                                    <Loader2
                                                        className="
                                                        mr-2
                                                        h-4
                                                        w-4
                                                        animate-spin
                                                    "
                                                    />

                                                    Delivering...

                                                </>

                                            ) : delivered ? (

                                                <>

                                                    <Check
                                                        className="
                                                        mr-2
                                                        h-4
                                                        w-4
                                                    "
                                                    />

                                                    Delivered

                                                </>

                                            ) : (

                                                <>

                                                    <Truck
                                                        className="
                                                        mr-2
                                                        h-4
                                                        w-4
                                                    "
                                                    />

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
