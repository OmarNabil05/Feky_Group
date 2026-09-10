"use client";

import {
    DateSelector,
} from "@/components/ui/date-selector";

import { Textarea } from "@/components/ui/textarea";

import {
    Controller,
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

    const form = useFormContext<ContractFormData>();

    return (
        <div className="flex flex-col gap-4">

            {/* CONTRACT DATE */}

            <Controller
                control={form.control}
                name="date"
                render={({ field }) => (

                    <div
                        className={
                            disabled
                                ? "pointer-events-none opacity-60"
                                : ""
                        }
                    >
                        <DateSelector
                            value={field.value}
                            onChange={field.onChange}
                            className=""
                        />
                    </div>

                )}
            />


            {/* NOTES */}

            <Controller
                control={form.control}
                name="notes"
                render={({ field }) => (

                    <Textarea
                        maxLength={20}
                        value={field.value}
                        placeholder="Type your message here."
                        disabled={disabled}
                        onChange={field.onChange}
                    />

                )}
            />

        </div>
    );
}