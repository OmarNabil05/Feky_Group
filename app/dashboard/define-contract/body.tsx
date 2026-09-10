
"use client";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/ComboboxEdited";
import { Input } from "@/components/ui/input";

import {
    Controller,
    useFieldArray,
    useFormContext,
} from "react-hook-form";

import type {
    ContractFormData,
} from "./contract-form";

type Item = {
    CardGuide: string;
    CardCode: string;
    ProductName: string;
};

type BodyProps = {
    items: Item[];
    disabled?: boolean;
};

export default function Body({
    items,
    disabled = false,
}: BodyProps) {

    const form =
        useFormContext<ContractFormData>();

    const {
        fields,
        append,
        remove,
    } = useFieldArray({
        control: form.control,
        name: "products",
    });

    return (
        <div className="flex flex-col items-center gap-2 p-2">

            {fields.map((row, index) => (

                <div
                    key={row.id}
                    className="
                        flex
                        w-full
                        flex-col
                        gap-1
                        lg:flex-row
                    "
                >

                    {/* PRODUCT */}
                    <div className="lg:w-1/5">

                        <label>Product</label>

                        <Controller
                            control={form.control}
                            name={`products.${index}.cardGuide`}
                            render={({ field }) => (

                                <div
                                    className={
                                        disabled
                                            ? "pointer-events-none opacity-60"
                                            : ""
                                    }
                                >

                                    <Combobox
                                        options={items.map(
                                            (item) => ({
                                                value: item.CardGuide,
                                                label: item.ProductName,
                                            })
                                        )}

                                        placeholder="Select Product"

                                        value={field.value ?? ""}

                                        onChange={(value) => {

                                            field.onChange(value);

                                            const selectedItem =
                                                items.find(
                                                    (item) =>
                                                        item.CardGuide === value
                                                );

                                            if (selectedItem) {

                                                form.setValue(
                                                    `products.${index}.productName`,
                                                    selectedItem.ProductName,
                                                    {
                                                        shouldDirty: true,
                                                    }
                                                );

                                            }
                                        }}
                                    />

                                </div>
                            )}
                        />

                        {form.formState.errors.products?.[index]?.cardGuide && (
                            <p className="text-sm font-medium text-destructive">
                                {
                                    form.formState.errors
                                        .products[index]
                                        ?.cardGuide?.message
                                }
                            </p>
                        )}

                    </div>


                    {/* DELIVERY DATE */}
                    <div className="lg:w-1/5">

                        <label>Delivery Date</label>

                        <Input
                            type="date"
                            disabled={disabled}
                            {...form.register(
                                `products.${index}.date`
                            )}
                        />

                        {form.formState.errors.products?.[index]?.date && (
                            <p className="text-sm font-medium text-destructive">
                                {
                                    form.formState.errors
                                        .products[index]
                                        ?.date?.message
                                }
                            </p>
                        )}

                    </div>


                    {/* QUANTITY */}
                    <div className="lg:w-1/5">

                        <label>Quantity</label>

                        <Input
                            type="number"
                            min={1}
                            disabled={disabled}
                            {...form.register(
                                `products.${index}.quantity`,
                                {
                                    valueAsNumber: true,
                                }
                            )}
                        />

                        {form.formState.errors.products?.[index]?.quantity && (
                            <p className="text-sm font-medium text-destructive">
                                {
                                    form.formState.errors
                                        .products[index]
                                        ?.quantity?.message
                                }
                            </p>
                        )}

                    </div>


                    {/* PRICE */}
                    <div className="lg:w-1/5">

                        <label>Price</label>

                        <Input
                            type="number"
                            min={0}
                            disabled={disabled}
                            {...form.register(
                                `products.${index}.price`,
                                {
                                    valueAsNumber: true,
                                }
                            )}
                        />

                        {form.formState.errors.products?.[index]?.price && (
                            <p className="text-sm font-medium text-destructive">
                                {
                                    form.formState.errors
                                        .products[index]
                                        ?.price?.message
                                }
                            </p>
                        )}

                    </div>


                    {/* DELIVERY STATUS */}
                    <div className="flex flex-col lg:w-1/5">

                        <label>Delivery Status</label>

                        <div
                            className="
                                flex
                               py-1.25
                                items-center
                                rounded-lg
                                border
                                px-3
                                text-sm
                            "
                        >
                            {row.delivered
                                ? "Delivered"
                                : "Not Delivered"}
                        </div>

                    </div>


                    {/* REMOVE */}
                    {!disabled && (

                        <div className="flex justify-center lg:items-end">

                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() =>
                                    remove(index)
                                }
                            >
                                -
                            </Button>

                        </div>

                    )}

                </div>

            ))}


            {/* ADD ROW */}
            {!disabled && (

                <div className="flex w-full justify-center">

                    <Button
                        type="button"
                        className="
                            bg-green-500
                            text-white
                            dark:bg-green-900
                        "
                        size="lg"
                        onClick={() => {

                            append({
                                cardGuide: "",
                                productName: "",
                                date: new Date()
                                    .toISOString()
                                    .split("T")[0],
                                quantity: 1,
                                price: 1,
                                delivered: false,
                            });

                        }}
                    >
                        Add a Row
                    </Button>

                </div>

            )}

        </div>
    );
}

