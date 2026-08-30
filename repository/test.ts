"use server";

import getConnection  from "@/lib/db";

export async function testDatabase() {
    try {
        const pool = await getConnection();

        const result = await pool.request().query(`
            SELECT 1 AS Connected
        `);

        console.log("DATABASE CONNECTED:", result.recordset);

        return {
            success: true,
            data: result.recordset,
        };
    } catch (error) {
        console.error("DATABASE CONNECTION ERROR:", error);

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unknown database error",
        };
    }
}