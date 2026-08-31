import { z } from "zod";

export const ItemSchema = z.object({
    ProductName: z
        .string({
            error: "Product name is required",
        })
        .trim()
        .min(1, "Product name is required")
        .max(255, "Product name is too long"),

    MinLimit: z
        .number({
            error: "Min limit is required",
        })
        .min(0, "Min limit must be greater than or equal to zero")
        .optional(),

    MaxLimit: z
        .number({
            error: "Max limit is required",
        })
        .min(1, "Max limit must be greater than or equal to one")
        .optional(),

    Source: z
        .string({
            error: "Source must be text",
        })
        .trim()
        .min(1, "Enter more than a letter for source")
        .optional(),

    Specification: z
        .string({
            error: "Specification must be text",
        })
        .trim()
        .min(1, "Enter more than a letter for specification")
        .optional(),

    Width: z
        .number({
            error: "Width is required",
        })
        .min(1, "Width must be greater than or equal to one"),

    Hieght: z
        .number({
            error: "Height is required",
        })
        .min(1, "Height must be greater than or equal to one"),
});

export type ItemFormData = z.infer<typeof ItemSchema>;