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
    ArcheiveName: string;
    Notes: string;
    Total: number;
    Products: InsertContractProduct[];
};

export type ContractProduct = {
    ID: number;
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
    ArcheiveName: string;
    Notes: string;

    Status: number;
    Total: number;

    MainGuide: string;

    // Body
    Products: ContractProduct[];
};

export type ContractListItem = {
    CardGuide: string;

    ArcheiveName: string;
    AgentName: string;
    WarehouseName: string;
    CurrencyName: string;
    CardDate: Date;

    Status: number;
    Total: number;
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
        {
            Header: "Total",
            Accessor: "Total",
        },
        {
            Header: "Finished",
            Accessor: "Status",
        },
    ];