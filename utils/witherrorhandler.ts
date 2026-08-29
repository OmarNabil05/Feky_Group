import { errorHandler } from "./errorHandler";

export async function withErrorHandler<T>(
    action: () => Promise<T>
) {
    try {
        const data = await action();

        return {
            success: true,
            data,
        };
    } catch (error) {
        return errorHandler(error);
    }
}