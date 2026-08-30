
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

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { ItemSchema } from "@/validations/items.validation";

type FormData = z.infer<typeof ItemSchema>;

/*
 * The item returned from the database can contain
 * fields that are NOT part of the form schema.
 *
 * CardCode is one of those fields.
 */
type CreatedItem = FormData & {
    CardCode: string;
};

/*
 * Result returned by createItemAction.
 */
type SubmitResult = {
    success: boolean;
    message?: string;
    data?: CreatedItem;
};

type DeleteResult = {
    success: boolean;
    message?: string;
};

type FormProps = {
    defaultValues?: Partial<FormData>;

    onSubmit: (
        data: FormData
    ) => Promise<SubmitResult>;

    onDelete: (
        cardCode: string
    ) => Promise<DeleteResult>;

    submitText?: string;
    loadingText?: string;
    title?: string;
};

export default function Form({
    defaultValues,
    onSubmit,
    onDelete,
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

    /*
     * Prevent double submission.
     */
    const [isSubmitting, setIsSubmitting] =
        React.useState(false);

    /*
     * The item returned after successful creation.
     */
    const [insertedItem, setInsertedItem] =
        React.useState<CreatedItem | null>(null);

    /*
     * Controls the success dialog.
     */
    const [showDialog, setShowDialog] =
        React.useState(false);

    /*
     * Prevents multiple Undo clicks.
     */
    const [isDeleting, setIsDeleting] =
        React.useState(false);


    /*
     * SUBMIT
     */
    async function handleSubmit(data: FormData) {

        try {

            setIsSubmitting(true);

            const result = await onSubmit(data);

            /*
             * Backend returned an error.
             *
             * The action already converted the error
             * into { success: false, message }.
             */
            if (!result.success) {

                console.error(
                    result.message ?? "Failed to create item"
                );

                return;
            }

            /*
             * We need the inserted item.
             */
            if (!result.data) {

                console.error(
                    "Item was created but no item data was returned."
                );

                return;
            }

            /*
             * Save the inserted item.
             */
            setInsertedItem(result.data);

            /*
             * Open success dialog.
             */
            setShowDialog(true);

            /*
             * Clear the form.
             */
            form.reset();

        } finally {

            setIsSubmitting(false);

        }
    }


    /*
     * EDIT
     *
     * Put the inserted item's form fields
     * back into React Hook Form.
     */
    function editInsertedItem() {

        if (!insertedItem) {
            return;
        }

        /*
         * CardCode is NOT part of the form.
         * We only put form fields back into the form.
         */
        form.reset({
            ProductName: insertedItem.ProductName,
            MinLimit: insertedItem.MinLimit,
            MaxLimit: insertedItem.MaxLimit,
            Source: insertedItem.Source,
            Specification: insertedItem.Specification,
            Width: insertedItem.Width,
            Hieght: insertedItem.Hieght,
        });

        setShowDialog(false);
    }


    /*
     * UNDO
     *
     * The Form does NOT need to know how deletion works.
     *
     * It only gives CardCode to the parent's onDelete.
     */
    async function undoInsertedItem() {

        if (!insertedItem) {
            return;
        }

        try {

            setIsDeleting(true);

            const result = await onDelete(
                insertedItem.CardCode
            );

            if (!result.success) {

                console.error(
                    result.message ?? "Failed to delete item"
                );

                return;
            }

            /*
             * Delete succeeded.
             */
            setInsertedItem(null);
            setShowDialog(false);
            form.reset();

        } finally {

            setIsDeleting(false);

        }
    }


    /*
     * ERROR POPOVER
     */
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
        <>
            <Card className="w-full">

                <CardHeader>
                    <CardTitle>
                        {title}
                    </CardTitle>
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
                        {isSubmitting
                            ? loadingText
                            : submitText}
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


            {/* SUCCESS DIALOG */}

            <Dialog
                open={showDialog}
                onOpenChange={setShowDialog}
            >

                <DialogContent className="w-[95%] max-w-lg">

                    <DialogHeader>

                        <DialogTitle>
                            Item Added Successfully
                        </DialogTitle>

                        <DialogDescription>
                            The item was successfully inserted
                            into the database.
                        </DialogDescription>

                    </DialogHeader>


                    {/* INSERTED ITEM */}

                    <div className="rounded-lg border bg-muted p-4">

                        <pre className="max-h-80 overflow-auto text-sm whitespace-pre-wrap break-words">
                            {JSON.stringify(
                                insertedItem,
                                null,
                                2
                            )}
                        </pre>

                    </div>


                    <DialogFooter className="flex flex-col gap-2 sm:flex-row">

                        {/* EDIT */}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={editInsertedItem}
                            disabled={isDeleting}
                        >
                            Edit
                        </Button>


                        {/* UNDO */}

                        <Button
                            type="button"
                            variant="destructive"
                            onClick={undoInsertedItem}
                            disabled={isDeleting}
                        >
                            {isDeleting
                                ? "Undoing..."
                                : "Undo"}
                        </Button>


                        {/* CLOSE */}

                        <Button
                            type="button"
                            onClick={() =>
                                setShowDialog(false)
                            }
                            disabled={isDeleting}
                        >
                            Close
                        </Button>

                    </DialogFooter>

                </DialogContent>

            </Dialog>
        </>
    );
}

