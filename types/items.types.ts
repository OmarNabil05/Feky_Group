export interface ItemsSchema {
    ProductName: string;
    MinLimit?: number;
    MaxLimit?: number;
    Source?: string;
    Specification?: string;
    Width?: number;
    Hieght?: number;
    CardImage?: Buffer | null;
    CardCode?: string;
}

type ColumnHeaders =
    {
        Header: string,
        Accessor: keyof ItemsSchema,
    }
export const ColumnsKeys: ColumnHeaders[] =
    [
        {
            Header: "ID",
            Accessor: "CardCode"
        },
        {
            Header: "Product Name",
            Accessor: "ProductName"
        },
        {
            Header: "Source",
            Accessor: "Source"
        },
        {
            Header: "Specification",
            Accessor: "Specification"
        },
        {
            Header: "Width",
            Accessor: "Width"
        },
        {
            Header: "Hieght",
            Accessor: "Hieght"
        },
        {
            Header: "Min Limit",
            Accessor: "MinLimit"
        },
        {
            Header: "Max Limit",
            Accessor: "MaxLimit"
        }
    ]