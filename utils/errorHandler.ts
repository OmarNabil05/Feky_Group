import { ZodError } from "zod";
import { AppError } from "./AppError";

export function errorHandler(error: unknown) {

    // 1. Validation errors
    if (error instanceof ZodError) {
        return {
            success: false,
            message: "Validation failed",
            errors: error.issues,
        };
    }

    // 2. Expected application errors
    if (error instanceof AppError) {
        return {
            success: false,
            message: error.message,
        };
    }

    // 3. Unexpected errors
    console.error("Unexpected error:", error);

    return {
        success: false,
        message: "Something went wrong. Please try again later.",
    };
}