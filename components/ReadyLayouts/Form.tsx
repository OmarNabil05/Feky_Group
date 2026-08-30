"use client";

import * as React from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import { ItemSchema } from "@/validations/items.validation";

type FormData = z.infer<typeof ItemSchema>;

type FormProps = {
    defaultValues?: Partial<FormData>;
    onSubmit: (data: FormData) => void | Promise<void>;
    submitText?: string;
    loadingText?: string;
    title?: string;
};

export default function Form({
    defaultValues,
    onSubmit,
    submitText = "Add Item",
    loadingText = "Adding...",
    title = "Add Item",
}: FormProps) {

    const form = useForm<FormData>({
        resolver: zodResolver(ItemSchema),

        defaultValues: {
            ProductName: "",
            MinLimit: undefined,
            MaxLimit: undefined,
            Source: "",
            Specification: "",
            Width: undefined,
            Hieght: undefined,

            ...defaultValues,
        },
    });

    const [isSubmitting, setIsSubmitting] =
        React.useState(false);


    async function handleSubmit(data: FormData) {

        try {

            setIsSubmitting(true);

            await onSubmit(data);

        } finally {

            setIsSubmitting(false);

        }
    }


    function renderError(error?: string) {

        if (!error) {
            return null;
        }

        return (
            <Popover>

                <PopoverTrigger
                    render={
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="shrink-0 text-destructive"
                        >
                            <CircleAlert className="size-4" />
                        </Button>
                    }
                />

                <PopoverContent>

                    <p className="text-sm text-destructive">
                        {error}
                    </p>

                </PopoverContent>

            </Popover>
        );
    }


    return (
        <Card className="w-full">

            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>


            <CardContent>

                <form
                    id="ready-form"
                    onSubmit={form.handleSubmit(handleSubmit)}
                >

                    <FieldGroup>


                        {/* Product Name */}

                        <Controller
                            name="ProductName"
                            control={form.control}
                            render={({ field, fieldState }) => (

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

                                    <FieldLabel className="w-full shrink-0 sm:w-40">
                                        Product Name
                                    </FieldLabel>

                                    <div className="flex w-full gap-2">

                                        <Input
                                            {...field}
                                            placeholder="Product Name"
                                            aria-invalid={fieldState.invalid}
                                        />

                                        {renderError(
                                            fieldState.error?.message
                                        )}

                                    </div>

                                </div>
                            )}
                        />


                        {/* Source */}

                        <Controller
                            name="Source"
                            control={form.control}
                            render={({ field, fieldState }) => (

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

                                    <FieldLabel className="w-full shrink-0 sm:w-40">
                                        Source
                                    </FieldLabel>

                                    <div className="flex w-full gap-2">

                                        <Input
                                            {...field}
                                            placeholder="Source"
                                            aria-invalid={fieldState.invalid}
                                        />

                                        {renderError(
                                            fieldState.error?.message
                                        )}

                                    </div>

                                </div>
                            )}
                        />


                        {/* Specification */}

                        <Controller
                            name="Specification"
                            control={form.control}
                            render={({ field, fieldState }) => (

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

                                    <FieldLabel className="w-full shrink-0 sm:w-40">
                                        Specification
                                    </FieldLabel>

                                    <div className="flex w-full gap-2">

                                        <Input
                                            {...field}
                                            placeholder="Specification"
                                            aria-invalid={fieldState.invalid}
                                        />

                                        {renderError(
                                            fieldState.error?.message
                                        )}

                                    </div>

                                </div>
                            )}
                        />


                        {/* Minimum Limit */}

                        <Controller
                            name="MinLimit"
                            control={form.control}
                            render={({ field, fieldState }) => (

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

                                    <FieldLabel className="w-full shrink-0 sm:w-40">
                                        Minimum Limit
                                    </FieldLabel>

                                    <div className="flex w-full gap-2">

                                        <Input
                                            type="number"
                                            placeholder="Minimum Limit"
                                            value={field.value ?? ""}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === ""
                                                        ? undefined
                                                        : Number(e.target.value)
                                                )
                                            }
                                            aria-invalid={fieldState.invalid}
                                        />

                                        {renderError(
                                            fieldState.error?.message
                                        )}

                                    </div>

                                </div>
                            )}
                        />


                        {/* Maximum Limit */}

                        <Controller
                            name="MaxLimit"
                            control={form.control}
                            render={({ field, fieldState }) => (

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

                                    <FieldLabel className="w-full shrink-0 sm:w-40">
                                        Maximum Limit
                                    </FieldLabel>

                                    <div className="flex w-full gap-2">

                                        <Input
                                            type="number"
                                            placeholder="Maximum Limit"
                                            value={field.value ?? ""}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === ""
                                                        ? undefined
                                                        : Number(e.target.value)
                                                )
                                            }
                                            aria-invalid={fieldState.invalid}
                                        />

                                        {renderError(
                                            fieldState.error?.message
                                        )}

                                    </div>

                                </div>
                            )}
                        />


                        {/* Width */}

                        <Controller
                            name="Width"
                            control={form.control}
                            render={({ field, fieldState }) => (

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

                                    <FieldLabel className="w-full shrink-0 sm:w-40">
                                        Width
                                    </FieldLabel>

                                    <div className="flex w-full gap-2">

                                        <Input
                                            type="number"
                                            placeholder="Width"
                                            value={field.value ?? ""}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === ""
                                                        ? undefined
                                                        : Number(e.target.value)
                                                )
                                            }
                                            aria-invalid={fieldState.invalid}
                                        />

                                        {renderError(
                                            fieldState.error?.message
                                        )}

                                    </div>

                                </div>
                            )}
                        />


                        {/* Height */}

                        <Controller
                            name="Hieght"
                            control={form.control}
                            render={({ field, fieldState }) => (

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

                                    <FieldLabel className="w-full shrink-0 sm:w-40">
                                        Height
                                    </FieldLabel>

                                    <div className="flex w-full gap-2">

                                        <Input
                                            type="number"
                                            placeholder="Height"
                                            value={field.value ?? ""}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === ""
                                                        ? undefined
                                                        : Number(e.target.value)
                                                )
                                            }
                                            aria-invalid={fieldState.invalid}
                                        />

                                        {renderError(
                                            fieldState.error?.message
                                        )}

                                    </div>

                                </div>
                            )}
                        />

                    </FieldGroup>

                </form>

            </CardContent>


            <CardFooter className="flex gap-2 py-2 justify-center lg:justify-end">

                <Button
                    type="submit"
                    form="ready-form"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? loadingText : submitText}
                </Button>


                <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    disabled={isSubmitting}
                >
                    Reset
                </Button>

            </CardFooter>

        </Card>
    );
}