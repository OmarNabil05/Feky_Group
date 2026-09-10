import { z } from "zod";

function isTodayOrLater(value: string) {
    const today = new Date();

    const todayString =
        today.toISOString().split("T")[0];

    return value >= todayString;
}

const DateSchema = z
    .string({
        error: "Please enter a valid date",
    })
    .min(1, "Date is required")
    .refine(isTodayOrLater, {
        message: "Date cannot be older than today",
    });

const ContractProductSchema = z.object({

    cardGuide: z
        .string({
            error: "Please select a product",
        })
        .min(1, "Product is required"),

    productName: z
        .string({
            error: "Invalid product name",
        }),

    date: DateSchema,

    quantity: z
        .number({
            error: "Please enter a valid quantity",
        })
        .positive("Quantity must be greater than 0"),

    price: z
        .number({
            error: "Please enter a valid price",
        })
        .nonnegative("Price cannot be negative"),

    delivered: z.boolean(),
});

export const ContractSchema = z.object({

    contractName: z
        .string({
            error: "Contract name must be text",
        })
        .trim()
        .min(1, "Contract name is required"),

    agent: z
        .string({
            error: "Agent must be valid",
        })
        .min(1, "Agent is required"),

    currency: z
        .string({
            error: "Currency must be valid",
        })
        .min(1, "Currency is required"),

    warehouse: z
        .string({
            error: "Warehouse must be valid",
        })
        .min(1, "Warehouse is required"),

    date: DateSchema,

    notes: z
        .string({
            error: "Notes must be text",
        }),

    products: z
        .array(ContractProductSchema, {
            error: "Invalid products",
        })
        .min(1, "At least one product is required"),
});