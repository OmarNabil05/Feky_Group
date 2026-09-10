"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
    useFormContext,
} from "react-hook-form";

import type {
    ContractFormData,
} from "./contract-form";


type StaticFieldsProps = {
    disabled?: boolean;
};


export default function StaticFields({
    disabled = false,
}: StaticFieldsProps) {

    const form =
        useFormContext<ContractFormData>();


    return (
        <div className="flex flex-col gap-4">

            {/* CONTRACT DATE */}

            <div className="flex flex-col gap-1">

                <label>
                    Contract Date
                </label>

                <Input
                    type="date"
                    disabled={disabled}
                    {...form.register("date")}
                />

                {form.formState.errors.date && (
                    <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.date.message}
                    </p>
                )}

            </div>


            {/* NOTES */}

            <Textarea
                maxLength={20}
                value={form.watch("notes")}
                placeholder="Type your message here."
                disabled={disabled}
                onChange={(e) =>
                    form.setValue(
                        "notes",
                        e.target.value,
                        {
                            shouldDirty: true,
                        }
                    )
                }
            />

        </div>
    );
}