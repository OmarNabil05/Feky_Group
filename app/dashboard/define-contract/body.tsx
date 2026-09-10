"use client";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/ComboboxEdited";
import {
    DateSelector,

} from "@/components/ui/date-selector";
import { Input } from "@/components/ui/input";

import {
    Controller,
    useFieldArray,
    useFormContext,
} from "react-hook-form";

import type { ContractFormData } from "./contract-form";

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

    // Get the SAME form created in ContractForm
    const form = useFormContext<ContractFormData>();

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "products",
    });

    return (
        <div className="flex flex-col gap-2 p-2 items-center">

            {fields.map((field, index) => (

                <div
                    key={field.id}
                    className="flex flex-col lg:flex-row w-full item-end  gap-1"
                >

                    {/* PRODUCT */}

                    <div className="lg:w-1/4">

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
                                        options={items.map((item) => ({
                                            value: item.CardGuide,
                                            label: item.ProductName,
                                        }))}
                                        placeholder="Select Product"
                                        value={field.value}
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
                                                    selectedItem.ProductName
                                                );

                                            }

                                        }}
                                    />

                                </div>

                            )}
                        />

                    </div>


                    {/* DATE */}

                    <div className="lg:w-1/4">

                        <label>Date</label>

                        <Controller
                            control={form.control}
                            name={`products.${index}.date`}
                            render={({ field }) => (

                                <DateSelector
                                    value={field.value}
                                    onChange={field.onChange}
                                    className=""
                                />

                            )}
                        />

                    </div>


                    {/* QUANTITY */}

                    <div className="lg:w-1/4">

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

                    </div>

                    <div className="lg:w-1/4">

                        <label>Price</label>

                        <Input
                            type="number"
                            min={1}
                            disabled={disabled}
                            {...form.register(
                                `products.${index}.price`,
                                {
                                    valueAsNumber: true,
                                }
                            )}
                        />

                    </div>


                    {/* REMOVE */}

                    {!disabled && (

                        <div className="  flex lg:items-end justify-center lg:justify-self-auto">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => remove(index)}

                            >
                                -
                            </Button>
                        </div>

                    )}

                </div>

            ))}


            {/* ADD */}

            {!disabled && (

                <div className="flex justify-center  w-full">

                    <Button
                        type="button"
                        className="dark:bg-green-900 bg-green-500 text-white"
                        size="lg"
                        onClick={() =>
                            append({
                                cardGuide: "",
                                productName: "",

                                date: {
                                    period: "day",
                                    operator: "is",
                                    startDate: new Date(),
                                },

                                quantity: 1,
                                price: 1
                            })
                        }
                    >
                        Add a Row
                    </Button>

                </div>

            )}

        </div>
    );
}