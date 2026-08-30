import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./AppError";

type Success<T> = {
    success: true;
    data: T;
};

type Failure = {
    success: false;
    message: string;
    errors?: ZodError["issues"];
};

export async function withErrorHandler<T>(
    callback: () => Promise<T>
): Promise<Success<T> | Failure> {
    try {
        const data = await callback();

        return {
            success: true,
            data,
        };
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            return {
                success: false,
                message: "Validation failed",
                errors: error.issues,
            };
        }

        if (error instanceof AppError) {
            return {
                success: false,
                message: error.message,
            };
        }

        console.error(error);

        return {
            success: false,
            message: "Internal server error",
        };
    }
}