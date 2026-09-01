/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import * as React from "react";
import * as z from "zod";

import {
    Controller,
    FieldValues,
    Path,
    useForm,
    DefaultValues,
    Resolver,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
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

import { toast } from "@/components/ui/toast";


/*
 * =========================================================
 * FIELD CONFIGURATION
 * =========================================================
 */

export type FormField<
    TFormData extends FieldValues
> = {
    name: Path<TFormData>;
    label: string;
    type: "text" | "number";
    placeholder?: string;
};


/*
 * =========================================================
 * SUBMIT RESULT
 * =========================================================
 */

type SubmitResult<TData> = {
    success: boolean;
    message?: string;
    data?: TData;
};


/*
 * =========================================================
 * DELETE RESULT
 * =========================================================
 */

type DeleteResult = {
    success: boolean;
    message?: string;
};


/*
 * =========================================================
 * FORM PROPS
 * =========================================================
 *
 * TUpdateData is ONE object.
 *
 * Example:
 *
 * {
 *     cardCode: "CARD001",
 *     item: formData
 * }
 *
 * This is intentional.
 *
 * We do NOT spread it.
 * =========================================================
 */

type FormProps<
    TFormData extends FieldValues,
    TCreatedData,
    TDeleteData,
    TUpdateData extends object
> = {

    schema: z.ZodType<TFormData>;

    fields: FormField<TFormData>[];

    defaultValues?: DefaultValues<TFormData>;


    /*
     * CREATE
     */

    onSubmit: (
        data: TFormData
    ) => Promise<SubmitResult<TCreatedData>>;


    /*
     * DELETE
     */

    getDeleteData: (
        data: TCreatedData
    ) => TDeleteData;

    onDelete: (
        data: TDeleteData
    ) => Promise<DeleteResult>;


    /*
     * UPDATE
     *
     * Convert:
     *
     * createdData + formData
     *
     * into the object required
     * by the update action.
     */

    getUpdateData: (
        createdData: TCreatedData,
        formData: TFormData
    ) => TUpdateData;


    /*
     * UPDATE ACTION
     *
     * Receives ONE object.
     */

    onUpdate: (
        data: TUpdateData
    ) => Promise<SubmitResult<TCreatedData>>;


    children?: React.ReactNode;

    submitText?: string;
    loadingText?: string;
    title?: string;

    successTitle?: string;
    successDescription?: string;

    updateSuccessTitle?: string;
    updateSuccessDescription?: string;
};


/*
 * =========================================================
 * GENERAL FORM
 * =========================================================
 */

export default function Form<
    TFormData extends FieldValues,
    TCreatedData,
    TDeleteData,
    TUpdateData extends object
>({
    schema,
    fields,
    defaultValues,

    onSubmit,

    getDeleteData,
    onDelete,

    getUpdateData,
    onUpdate,

    children,

    submitText = "Submit",
    loadingText = "Submitting...",
    title = "Form",

    successTitle = "Successfully Added",

    successDescription =
    "The record was successfully inserted.",

    updateSuccessTitle =
    "Successfully Updated",

    updateSuccessDescription =
    "The record was successfully updated.",

}: FormProps<
    TFormData,
    TCreatedData,
    TDeleteData,
    TUpdateData
>) {


    /*
     * =====================================================
     * REACT HOOK FORM
     * =====================================================
     */

    const form = useForm<TFormData>({
        resolver:
            zodResolver(schema as any) as Resolver<TFormData>,

        defaultValues,
    });


    /*
     * =====================================================
     * STATE
     * =====================================================
     */

    const [isSubmitting, setIsSubmitting] =
        React.useState(false);

    const [insertedData, setInsertedData] =
        React.useState<TCreatedData | null>(null);

    const [showDialog, setShowDialog] =
        React.useState(false);

    const [isDeleting, setIsDeleting] =
        React.useState(false);

    const [isEditing, setIsEditing] =
        React.useState(false);

    const [dialogMode, setDialogMode] =
        React.useState<"create" | "update">("create");


    /*
     * =====================================================
     * CLEAR FORM
     * =====================================================
     */

    function clearForm() {

        const emptyValues:
            Record<string, unknown> = {};

        for (const field of fields) {

            emptyValues[field.name] =
                field.type === "number"
                    ? undefined
                    : "";
        }

        form.reset(
            emptyValues as DefaultValues<TFormData>
        );

        setIsEditing(false);
    }


    /*
     * =====================================================
     * SUBMIT
     * =====================================================
     */

    async function handleSubmit(
        data: TFormData
    ) {

        try {

            setIsSubmitting(true);


            /*
             * =================================================
             * UPDATE MODE
             * =================================================
             */

            if (isEditing && insertedData) {

                /*
                 * Build the COMPLETE update object.
                 *
                 * Example:
                 *
                 * {
                 *     cardCode: "CARD001",
                 *     item: data
                 * }
                 */

                const updateData =
                    getUpdateData(
                        insertedData,
                        data
                    );


                /*
                 * IMPORTANT:
                 *
                 * Make sure getUpdateData()
                 * actually returned an object.
                 */

                if (
                    updateData === null ||
                    updateData === undefined
                ) {

                    console.error(
                        "getUpdateData() returned undefined/null."
                    );

                    toast.add({
                        type: "error",
                        title: "Update Error",
                        description:
                            "Update data was not created correctly.",
                    });

                    return;
                }


                /*
                 * Call update action.
                 *
                 * ONE argument.
                 *
                 * NO spread.
                 */

                const result =
                    await onUpdate(
                        updateData
                    );


                /*
                 * UPDATE FAILED
                 */

                if (!result.success) {

                    toast.add({
                        type: "error",
                        title: "Error",
                        description:
                            result.message ??
                            "Failed to update.",
                    });

                    return;
                }


                /*
                 * UPDATE SUCCEEDED
                 * BUT NO DATA RETURNED
                 */

                if (!result.data) {

                    toast.add({
                        type: "error",
                        title: "Error",
                        description:
                            "Update succeeded but no data was returned.",
                    });

                    return;
                }


                /*
                 * Save updated object.
                 */

                setInsertedData(
                    result.data
                );


                /*
                 * Dialog is for UPDATE.
                 */

                setDialogMode("update");


                /*
                 * Leave edit mode.
                 */

                setIsEditing(false);


                /*
                 * Success toast.
                 */

                toast.add({
                    type: "success",
                    title: "Success",
                    description:
                        "Item updated successfully.",
                });


                /*
                 * Clear form.
                 */

                clearForm();


                /*
                 * Show dialog.
                 */

                setShowDialog(true);

                return;
            }


            /*
             * =================================================
             * CREATE MODE
             * =================================================
             */

            const result =
                await onSubmit(data);


            /*
             * CREATE FAILED
             */

            if (!result.success) {

                toast.add({
                    type: "error",
                    title: "Error",
                    description:
                        result.message ??
                        "Failed to submit.",
                });

                return;
            }


            /*
             * CREATE SUCCEEDED
             * BUT NO DATA RETURNED
             */

            if (!result.data) {

                toast.add({
                    type: "error",
                    title: "Error",
                    description:
                        "Operation succeeded but no data was returned.",
                });

                return;
            }


            /*
             * Save created object.
             */

            setInsertedData(
                result.data
            );


            /*
             * Dialog is for CREATE.
             */

            setDialogMode("create");


            /*
             * Success toast.
             */

            toast.add({
                type: "success",
                title: "Success",
                description:
                    "Record added successfully.",
            });


            /*
             * Show dialog.
             */

            setShowDialog(true);


            /*
             * Clear form.
             */

            clearForm();

        } catch (error) {

            console.error(
                "Form submission error:",
                error
            );

            toast.add({
                type: "error",
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "An unexpected error occurred.",
            });

        } finally {

            setIsSubmitting(false);
        }
    }


    /*
     * =====================================================
     * EDIT
     * =====================================================
     */

    function editInsertedData() {

        if (!insertedData) {
            return;
        }


        const values:
            Partial<TFormData> = {};


        const createdObject =
            insertedData as Record<
                string,
                unknown
            >;


        for (const fieldConfig of fields) {

            const fieldName =
                fieldConfig.name;

            const value =
                createdObject[fieldName];


            if (value !== undefined) {

                (
                    values as Record<
                        string,
                        unknown
                    >
                )[fieldName] = value;
            }
        }


        form.reset(
            values as DefaultValues<TFormData>
        );


        setIsEditing(true);

        setShowDialog(false);
    }


    /*
     * =====================================================
     * UNDO / DELETE
     * =====================================================
     */

    async function undoInsertedData() {

        if (!insertedData) {
            return;
        }


        try {

            setIsDeleting(true);


            const deleteData =
                getDeleteData(
                    insertedData
                );


            const result =
                await onDelete(
                    deleteData
                );


            if (!result.success) {

                toast.add({
                    type: "error",
                    title: "Error",
                    description:
                        result.message ??
                        "Failed to delete.",
                });

                return;
            }


            toast.add({
                type: "success",
                title: "Success",
                description:
                    "Record deleted successfully.",
            });


            setInsertedData(null);

            setIsEditing(false);

            setShowDialog(false);

            clearForm();

        } catch (error) {

            console.error(
                "Delete error:",
                error
            );

            toast.add({
                type: "error",
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to delete.",
            });

        } finally {

            setIsDeleting(false);
        }
    }


    /*
     * =====================================================
     * ERROR POPOVER
     * =====================================================
     */

    function renderError(
        error?: {
            message?: string;
        }
    ) {
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
                        {error.message ?? "Invalid value"}
                    </p>
                </PopoverContent>
            </Popover>
        );
    }

    /*
     * =====================================================
     * RENDER
     * =====================================================
     */

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
                        onSubmit={
                            form.handleSubmit(
                                handleSubmit
                            )
                        }
                    >

                        <FieldGroup>

                            {fields.map(
                                (fieldConfig) => (

                                    <Controller
                                        key={
                                            fieldConfig.name
                                        }

                                        name={
                                            fieldConfig.name
                                        }

                                        control={
                                            form.control
                                        }

                                        render={({
                                            field,
                                            fieldState,
                                        }) => (

                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

                                                <FieldLabel className="w-full shrink-0 sm:w-40">

                                                    {
                                                        fieldConfig.label
                                                    }

                                                </FieldLabel>


                                                <div className="flex w-full gap-2">

                                                    {fieldConfig.type ===
                                                        "number" ? (

                                                        <Input
                                                            type="number"

                                                            placeholder={
                                                                fieldConfig.placeholder ??
                                                                fieldConfig.label
                                                            }

                                                            value={
                                                                field.value ??
                                                                ""
                                                            }

                                                            onChange={(
                                                                e
                                                            ) => {

                                                                const value =
                                                                    e.target.value;

                                                                field.onChange(
                                                                    value === ""
                                                                        ? undefined
                                                                        : Number(
                                                                            value
                                                                        )
                                                                );
                                                            }}

                                                            onBlur={
                                                                field.onBlur
                                                            }

                                                            name={
                                                                field.name
                                                            }

                                                            ref={
                                                                field.ref
                                                            }

                                                            aria-invalid={
                                                                fieldState.invalid
                                                            }
                                                        />

                                                    ) : (

                                                        <Input
                                                            type="text"

                                                            value={
                                                                field.value ??
                                                                ""
                                                            }

                                                            onChange={
                                                                field.onChange
                                                            }

                                                            onBlur={
                                                                field.onBlur
                                                            }

                                                            name={
                                                                field.name
                                                            }

                                                            ref={
                                                                field.ref
                                                            }

                                                            placeholder={
                                                                fieldConfig.placeholder ??
                                                                fieldConfig.label
                                                            }

                                                            aria-invalid={
                                                                fieldState.invalid
                                                            }
                                                        />
                                                    )}


                                                    {renderError(fieldState.error)}

                                                </div>

                                            </div>
                                        )}
                                    />
                                )
                            )}

                            {children}

                        </FieldGroup>

                    </form>

                </CardContent>


                <CardFooter className="flex justify-center gap-2 py-2 lg:justify-end">

                    <Button
                        type="submit"
                        form="ready-form"
                        disabled={
                            isSubmitting
                        }
                    >

                        {isSubmitting
                            ? loadingText
                            : isEditing
                                ? "Update"
                                : submitText}

                    </Button>


                    <Button
                        type="button"
                        variant="outline"
                        onClick={
                            clearForm
                        }
                        disabled={
                            isSubmitting
                        }
                    >
                        Reset
                    </Button>

                </CardFooter>

            </Card>


            {/* =================================================
                SUCCESS DIALOG
            ================================================= */}

            <Dialog
                open={showDialog}
                onOpenChange={
                    setShowDialog
                }
            >

                <DialogContent className="w-[95%] max-w-lg">

                    <DialogHeader>

                        <DialogTitle>

                            {dialogMode === "update"
                                ? updateSuccessTitle
                                : successTitle}

                        </DialogTitle>


                        <DialogDescription>

                            {dialogMode === "update"
                                ? updateSuccessDescription
                                : successDescription}

                        </DialogDescription>

                    </DialogHeader>


                    <div className="rounded-lg border bg-muted p-4">

                        <pre className="max-h-80 overflow-auto text-sm whitespace-pre-wrap wrap-break-word">

                            {JSON.stringify(
                                insertedData,
                                null,
                                2
                            )}

                        </pre>

                    </div>


                    <DialogFooter className="flex flex-col gap-2 sm:flex-row">

                        <Button
                            type="button"
                            variant="outline"
                            onClick={
                                editInsertedData
                            }
                            disabled={
                                isDeleting
                            }
                        >
                            Edit
                        </Button>


                        <Button
                            type="button"
                            variant="destructive"
                            onClick={
                                undoInsertedData
                            }
                            disabled={
                                isDeleting
                            }
                        >

                            {isDeleting
                                ? "Undoing..."
                                : "Undo"}

                        </Button>


                        <Button
                            type="button"
                            onClick={() =>
                                setShowDialog(false)
                            }
                            disabled={
                                isDeleting
                            }
                        >
                            Close
                        </Button>

                    </DialogFooter>

                </DialogContent>

            </Dialog>
        </>
    );
}

