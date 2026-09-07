
"use client";

import { Combobox } from "@/components/ui/ComboboxEdited";

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
};

export default function Selects({
    Agents,
    Currency,
    WareHouses,
}: SelectsProps) {

    const agentOptions = Agents.map(agent => ({
        value: agent.CardGuide,
        label: agent.AgentName,
    }));

    const currencyOptions = Currency.map(currency => ({
        value: currency.CardGuide,
        label: currency.CurrencyName,
    }));

    const wareHouseOptions = WareHouses.map(warehouse => ({
        value: warehouse.CardGuide,
        label: warehouse.WarehouseName,
    }));

    const Selectnames = [
        {
            Name: "AgentName",
            Options: agentOptions,
        },
        {
            Name: "CurrencyName",
            Options: currencyOptions,
        },
        {
            Name: "WarehouseName",
            Options: wareHouseOptions,
        },
    ];

    return (
        <div className="flex flex-col gap-4  w-full ">

            {Selectnames.map((select) => (
                <div className=" " key={select.Name}> <Combobox
                    key={select.Name}
                    options={select.Options}
                    placeholder={`Select ${select.Name}`}
                    onChange={(value, fullObject) => {
                        console.log(value);
                        console.log(fullObject);
                    }}
                /></div>
            ))}
        </div>
    );
}

