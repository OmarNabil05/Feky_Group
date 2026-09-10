
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
    FormProvider,
    useForm,
    useWatch,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import Selects from "./selects";
import StaticFields from "./staticFields";
import Body from "./body";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

import {
    createContractAction,
    updateContractAction,
} from "@/actions/contracts.action";

import { ContractSchema } from "@/validations/contracts.validation";


/* ==========================================================================
   TYPES
========================================================================== */

export type ContractProductFormData = {
    cardGuide: string;
    productName: string;
    date: string;
    quantity: number;
    price: number;

    /*
       This comes from the database.

       It is displayed in edit/view mode,
       but it is NOT sent back when creating/updating.
    */
    delivered: boolean;
};


export type ContractFormData = {
    contractName: string;
    agent: string;
    currency: string;
    warehouse: string;
    date: string;
    notes: string;
    products: ContractProductFormData[];
};


export type ContractMode =
    | "create"
    | "edit"
    | "view";


/* ==========================================================================
   BASIC TYPES
========================================================================== */

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


/* ==========================================================================
   PROPS
========================================================================== */

type ContractFormProps = {
    mode: ContractMode;

    Agents: Agent[];
    Currency: Currency[];
    WareHouses: Warehouse[];

    items: Item[];

    initialData?: Partial<ContractFormData>;

    cardGuide?: string;

    /*
       Contract Status from TBL085.

       0 = not finished
       1 = finished
    */
    status?: number;
};


/* ==========================================================================
   DEFAULT PRODUCT
========================================================================== */

function createDefaultProduct(): ContractProductFormData {
    return {
        cardGuide: "",

        productName: "",

        date: new Date()
            .toISOString()
            .split("T")[0],

        quantity: 1,

        price: 0,

        delivered: false,
    };
}


/* ==========================================================================
   COMPONENT
========================================================================== */

export default function ContractForm({
    mode,
    Agents,
    Currency,
    WareHouses,
    items,
    initialData,
    cardGuide,
    status,
}: ContractFormProps) {

    const isView =
        mode === "view";


    /* ==========================================================================
       FORM
    ========================================================================== */

    const form = useForm<ContractFormData>({
        resolver: zodResolver(ContractSchema),

        shouldUnregister: false,

        defaultValues: {

            contractName:
                initialData?.contractName ?? "",

            agent:
                initialData?.agent ?? "",

            currency:
                initialData?.currency ?? "",

            warehouse:
                initialData?.warehouse ?? "",

            date:
                initialData?.date ??
                new Date()
                    .toISOString()
                    .split("T")[0],

            notes:
                initialData?.notes ?? "",

            products:
                initialData?.products ??
                [createDefaultProduct()],
        },
    });


    /* ==========================================================================
       WATCH PRODUCTS
    ========================================================================== */

    const products =
        useWatch({
            control: form.control,
            name: "products",
        }) ?? [];


    /* ==========================================================================
       CALCULATE TOTAL
    ========================================================================== */

    const total =
        products.reduce(
            (sum, product) =>
                sum +
                (Number(product.quantity) || 0) *
                (Number(product.price) || 0),

            0
        );


    /* ==========================================================================
       SUBMIT
    ========================================================================== */

    async function handleSubmit(
        data: ContractFormData
    ) {

        console.log(
            "FORM VALIDATION PASSED"
        );

        console.log(
            "FORM DATA:",
            data
        );


        /* =========================
           VIEW MODE
        ========================= */

        if (mode === "view") {
            return;
        }


        /* ==========================================================================
           BACKEND DATA
        ========================================================================== */

        const contractData = {

            AgentGuide01:
                data.agent,

            Currency:
                data.currency,

            StoreID:
                data.warehouse,

            CardDate:
                new Date(data.date),

            ArcheiveName:
                data.contractName,

            Notes:
                data.notes,

            /*
               Total is calculated from
               quantity × price for every product.
            */
            Total:
                data.products.reduce(
                    (sum, product) =>
                        sum +
                        product.quantity *
                        product.price,

                    0
                ),

            /*
               Delivered is intentionally NOT sent.

               Delivery status belongs to
               the delivery workflow/database.
            */
            Products:
                data.products.map(
                    (product) => ({

                        ItemGuide:
                            product.cardGuide,

                        Quantity:
                            product.quantity,

                        Price:
                            product.price,

                        DeliveryDate:
                            new Date(product.date),

                    })
                ),
        };


        console.log(
            "CONTRACT DATA:",
            contractData
        );


        /* ==========================================================================
           CREATE
        ========================================================================== */

        if (mode === "create") {

            console.log(
                "CREATING CONTRACT..."
            );


            const result =
                await createContractAction(
                    contractData
                );


            console.log(
                "CREATE RESULT:",
                result
            );


            if (!result.success) {

                toast.add({
                    type: "error",
                    title: "Error",
                    description:
                        result.message ||
                        "Failed to create contract",
                });

                return;
            }


            toast.add({
                type: "success",
                title: "Success",
                description:
                    "Contract inserted successfully",
            });


            form.reset();

            return;
        }


        /* ==========================================================================
           EDIT
        ========================================================================== */

        if (mode === "edit") {

            console.log(
                "UPDATING CONTRACT..."
            );


            /* =========================
               CARD GUIDE CHECK
            ========================= */

            if (!cardGuide) {

                console.error(
                    "Contract CardGuide is missing"
                );

                toast.add({
                    type: "error",
                    title: "Error",
                    description:
                        "Contract ID is missing",
                });

                return;
            }


            console.log(
                "CONTRACT CARD GUIDE:",
                cardGuide
            );


            /* =========================
               UPDATE
            ========================= */

            const result =
                await updateContractAction(
                    cardGuide,
                    contractData
                );


            console.log(
                "UPDATE RESULT:",
                result
            );


            if (!result.success) {

                toast.add({
                    type: "error",
                    title: "Error",
                    description:
                        result.message ||
                        "Failed to update contract",
                });

                return;
            }


            toast.add({
                type: "success",
                title: "Success",
                description:
                    "Contract updated successfully",
            });

            return;
        }
    }


    /* ==========================================================================
       VALIDATION ERROR
    ========================================================================== */

    function handleValidationError(
        errors: any
    ) {

        console.error(
            "FORM VALIDATION ERRORS:",
            errors
        );


        toast.add({
            type: "error",
            title: "Validation Error",
            description:
                "Please fix the form errors",
        });
    }


    /* ==========================================================================
       RENDER
    ========================================================================== */

    return (

        <FormProvider {...form}>

            <form
                onSubmit={
                    form.handleSubmit(
                        handleSubmit,
                        handleValidationError
                    )
                }

                className="flex flex-col gap-4"
            >

                {/* ==========================================================
                    CONTRACT HEADER
                ========================================================== */}

                <div className="flex flex-col gap-4">


                    {/* ======================================================
                        CONTRACT NAME
                    ====================================================== */}

                    <div className="flex flex-col gap-2">

                        <Input
                            id="contractName"

                            placeholder="Enter contract name"

                            disabled={isView}

                            {...form.register(
                                "contractName"
                            )}
                        />

                        {form.formState.errors.contractName && (

                            <p className="text-sm font-medium text-destructive">

                                {
                                    form.formState
                                        .errors
                                        .contractName
                                        .message
                                }

                            </p>

                        )}

                    </div>


                    {/* ======================================================
                        SELECTS
                    ====================================================== */}

                    <Selects
                        Agents={Agents}
                        Currency={Currency}
                        WareHouses={WareHouses}
                        disabled={isView}
                    />


                    {/* ======================================================
                        STATIC FIELDS
                    ====================================================== */}

                    <StaticFields
                        disabled={isView}
                    />


                    {/* ======================================================
                        CONTRACT STATUS
                    ====================================================== */}

                    {mode !== "create" && (

                        <div className="flex items-center gap-3">

                            <span className="font-medium">
                                Contract Status:
                            </span>

                            <span
                                className={
                                    status === 1
                                        ? "font-semibold text-green-600"
                                        : "font-semibold text-yellow-600"
                                }
                            >
                                {status === 1
                                    ? "Finished"
                                    : "In Progress"}
                            </span>

                        </div>

                    )}

                </div>


                {/* ==========================================================
                    PRODUCTS
                ========================================================== */}

                <Body
                    items={items}
                    disabled={isView}
                />


                {/* ==========================================================
                    TOTAL
                ========================================================== */}

                <div className="flex justify-end">

                    <div className="flex items-center gap-3 text-lg font-semibold bg-green-500 dark:bg-green-900 py-2 px-5 rounded-4xl text-white">

                        <span>
                            Total:
                        </span>

                        <span>
                            {total.toLocaleString(
                                undefined,
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }
                            )}
                        </span>

                    </div>

                </div>


                {/* ==========================================================
                    SUBMIT
                ========================================================== */}

                {!isView && (

                    <div className="flex justify-end">

                        <Button
                            type="submit"

                            className="
                                rounded-md
                                bg-primary
                                px-4
                                py-2
                                text-primary-foreground
                            "
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

