import { ZodError } from "zod";
import { AppError } from "./AppError";

export function errorHandler(error: unknown) {

    // 1. Validation errors
    if (error instanceof ZodError) {
        console.error("ZOD ERROR:", error.issues);

        return {
            success: false,
            message: "Validation failed",
            errors: error.issues,
        };
    }

    // 2. Expected application errors
    if (error instanceof AppError) {
        console.error("APP ERROR:", error.message);

        return {
            success: false,
               message: error.message,
        };
    }

    // 3. Unexpected errors
    console.error("🔥 UNEXPECTED ERROR:", error);

    return {
        success: false,
        message: "Something went wrong. Please try again later.",
    };
}