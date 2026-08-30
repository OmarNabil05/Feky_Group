"use server";

import getConnection from "@/lib/db";

export async function testDatabaseAction() {
    try {
        const pool = await getConnection();

        const result = await pool.request().query(`
    SELECT
        DB_NAME() AS DatabaseName,
        @@SERVERNAME AS ServerName,
        @@SERVICENAME AS ServiceName
`);

        console.log("DATABASE INFO:", result.recordset);

        console.log("DATABASE TEST:", result.recordset);

        return {
            success: true,
            data: result.recordset,
        };
    } catch (error) {
        console.error("DATABASE TEST ERROR:", error);

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unknown database error",
        };
    }
}