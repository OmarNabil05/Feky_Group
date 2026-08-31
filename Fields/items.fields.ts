import { ItemFormData } from "@/validations/items.validation";

export const ItemFields = [
    {
        name: "ProductName",
        label: "Product Name",
        type: "text",
        placeholder: "Product Name",
    },

    {
        name: "Source",
        label: "Source",
        type: "text",
        placeholder: "Source",
    },

    {
        name: "Specification",
        label: "Specification",
        type: "text",
        placeholder: "Specification",
    },

    {
        name: "MinLimit",
        label: "Minimum Limit",
        type: "number",
        placeholder: "Minimum Limit",
    },

    {
        name: "MaxLimit",
        label: "Maximum Limit",
        type: "number",
        placeholder: "Maximum Limit",
    },

    {
        name: "Width",
        label: "Width",
        type: "number",
        placeholder: "Width",
    },

    {
        name: "Hieght",
        label: "Height",
        type: "number",
        placeholder: "Height",
    },
] satisfies {
    name: keyof ItemFormData;
    label: string;
    type: "text" | "number";
    placeholder?: string;
}[];