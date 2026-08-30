import { z } from "zod";

export const ItemSchema = z.object({
    ProductName: z
        .string()
        .trim()
        .min(1, "Product name is required")
        .max(255, "Product name is too long"),

    MinLimit: z
        .number()
        .min(0, "Min limit must be greater than or equal to zero")
        .optional(),

    MaxLimit: z
        .number()
        .min(1, "Max limit must be greater than or equal to one")
        .optional(),

    Source: z
        .string()
        .trim()
        .min(1, "enter more than a letter source")
        .optional(),

    Specification: z
        .string()
        .trim()
        .min(1, "enter more than a letter specification")
        .optional(),

    Width: z
        .number()
        .min(1, "width must be greater than or equal to one")
       ,

    Hieght: z
        .number()
        .min(1, "height must be greater than or equal to one")
        
});