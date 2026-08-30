import { ItemsSchema } from "@/types/items.types";
import { AppError } from "@/utils/AppError";

export function LimitsValidation(item: ItemsSchema) {
    const errors: string[] = [];

    if (item.MaxLimit !== undefined && item.MaxLimit < 1) {
        errors.push("Maximum limit must be greater than or equal to 1");
    }

    if (item.MinLimit !== undefined && item.MinLimit < 0) {
        errors.push("Minimum limit must be greater than or equal to 0");
    }

    if (
        item.MaxLimit !== undefined &&
        item.MinLimit !== undefined &&
        item.MaxLimit < item.MinLimit
    ) {
        errors.push("Maximum limit must be greater than or equal to minimum limit");
    }

    if (errors.length > 0) {
        throw new AppError(errors.join(", "), 400);
    }
}