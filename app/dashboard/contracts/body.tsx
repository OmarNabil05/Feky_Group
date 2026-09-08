"use client";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/ComboboxEdited";
import { DateSelector, DateSelectorValue } from "@/components/ui/date-selector";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";

type FormData = {
    products: {
        productName: string;
        date: Date | undefined;
        quantity: number;
    }[];
};

export default function Body() {
    const form = useForm<FormData>({
        defaultValues: {
            products: [
                {
                    productName: "",
                    date: undefined,
                    quantity: 1,
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "products",
    });

    const [date, setDate] = useState<DateSelectorValue>({
        period: "day" as const,
        operator: "is" as const,
        startDate: new Date(),
    });

    return (
        <div className="flex  flex-col gap-2 p-2 items-center ">
            {fields.map((field, index) => (
                <div key={field.id} className="flex  items-end gap-2">

                    {/* Product */}
                    <div>
                        <label>Product</label>
                        <Combobox

                            options={[]}
                            placeholder={`Select`}
                            onChange={(value, fullObject) => {
                                console.log(value);
                                console.log(fullObject);
                            }}
                        />                  </div>

                    {/* Date */}
                    <div>
                        <label>Date</label>

                        <DateSelector
                            value={date}
                            onChange={setDate}
                            className=''
                        />
                    </div>

                    {/* Quantity */}
                    <div>
                        <label>Quantity</label>
                        <Input
                            type="number"
                            {...form.register(`products.${index}.quantity`, {
                                valueAsNumber: true,
                            })}
                        />
                    </div>

                    {/* Remove */}
                    <Button

                        onClick={() => remove(index)}
                    >
                        -
                    </Button>
                </div>
            ))}

            {/* Add */}

            <div className="flex ">

                <Button

                    onClick={() =>
                        append({
                            productName: "",
                            date: undefined,
                            quantity: 1,
                        })
                    }
                >
                    +
                </Button>

                {/* Example submit */}
                <Button
                    type="button"
                    onClick={() => {
                        console.log(form.getValues());
                    }}
                >
                    Submit
                </Button>
            </div>
        </div>
    );
}