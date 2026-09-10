"use client";

import { Combobox } from "@/components/ui/ComboboxEdited";

import {
    Controller,
    useFormContext,
} from "react-hook-form";

import type {
    ContractFormData,
} from "./contract-form";

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

type SelectsProps = {
    Agents: Agent[];
    Currency: Currency[];
    WareHouses: Warehouse[];

    disabled?: boolean;
};

export default function Selects({
    Agents,
    Currency,
    WareHouses,
    disabled = false,
}: SelectsProps) {

    const form = useFormContext<ContractFormData>();

    const agentOptions = Agents.map((agent) => ({
        value: agent.CardGuide,
        label: agent.AgentName,
    }));

    const currencyOptions = Currency.map((currency) => ({
        value: currency.CardGuide,
        label: currency.CurrencyName,
    }));

    const wareHouseOptions = WareHouses.map((warehouse) => ({
        value: warehouse.CardGuide,
        label: warehouse.WarehouseName,
    }));


    return (
        <div className="flex flex-col gap-4 w-full">

            {/* AGENT */}

            <Controller
                control={form.control}
                name="agent"
                render={({ field }) => (

                    <div
                        className={
                            disabled
                                ? "pointer-events-none opacity-60"
                                : ""
                        }
                    >
                        <Combobox
                            options={agentOptions}
                            placeholder="Select Agent"
                            value={field.value}
                            onChange={field.onChange}
                        />
                    </div>

                )}
            />


            {/* CURRENCY */}

            <Controller
                control={form.control}
                name="currency"
                render={({ field }) => (

                    <div
                        className={
                            disabled
                                ? "pointer-events-none opacity-60"
                                : ""
                        }
                    >
                        <Combobox
                            options={currencyOptions}
                            placeholder="Select Currency"
                            value={field.value}
                            onChange={field.onChange}
                        />
                    </div>

                )}
            />


            {/* WAREHOUSE */}

            <Controller
                control={form.control}
                name="warehouse"
                render={({ field }) => (

                    <div
                        className={
                            disabled
                                ? "pointer-events-none opacity-60"
                                : ""
                        }
                    >
                        <Combobox
                            options={wareHouseOptions}
                            placeholder="Select WareHouses"
                            value={field.value}
                            onChange={field.onChange}
                        />
                    </div>

                )}
            />

        </div>
    );
}