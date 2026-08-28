import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./AppError";

export function errorHandler(error: unknown) {

    if (error instanceof ZodError) {
        return NextResponse.json(
            {
                message: "Validation failed",
                errors: error.issues,
            },
            { status: 400 }
        );
    }

    if (error instanceof AppError) {
        return NextResponse.json(
            {
                message: error.message,
            },
            { status: error.statusCode }
        );
    }

    console.error(error);

    return NextResponse.json(
        {
            message: "Internal server error",
        },
        { status: 500 }
    );
}