export type InsertContractProduct = {
    ItemGuide: string;
    Quantity: number;
    Price: number;
    DeliveryDate: Date;
};

export type InsertContractData = {
    AgentGuide01: string;
    Currency: string;
    StoreID: string;
    CardDate: Date;
    ArcheiveName: string; // NEW
    Notes: string;

    Products: InsertContractProduct[];
};

export type ContractProduct = {
    CardGuide: string;
    ItemGuide: string;
    Quantity: number;
    Price: number;
    DeliveryDate: Date;
    Delivered: boolean;
};

export type Contract = {
    CardGuide: string;

    // Header
    AgentGuide01: string;
    AgentName: string;

    Currency: string;
    CurrencyName: string;

    StoreID: string;
    WarehouseName: string;

    CardDate: Date;
    ArcheiveName: string; // NEW
    Notes: string;

    MainGuide: string;

    // Body
    Products: ContractProduct[];
};

export type ContractListItem = {
    CardGuide: string;       // still needed internally for routing
    ArcheiveName: string;    // what we DISPLAY
    AgentName: string;
    WarehouseName: string;
    CurrencyName: string;
    CardDate: Date;
};

export const ColumnsKeys: {
    Header: string;
    Accessor: keyof ContractListItem;
}[] = [
        {
            Header: "Contract Name",
            Accessor: "ArcheiveName",
        },
        {
            Header: "Agent",
            Accessor: "AgentName",
        },
        {
            Header: "Warehouse",
            Accessor: "WarehouseName",
        },
        {
            Header: "Currency",
            Accessor: "CurrencyName",
        },
        {
            Header: "Date",
            Accessor: "CardDate",
        },
    ];