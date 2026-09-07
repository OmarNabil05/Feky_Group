import getConnection from "@/lib/db";
import sql from "mssql";

// ==================== AGENTS ====================

export async function GetAgents() {
    const pool = await getConnection();

    const result = await pool.request().query(`
        SELECT CardGuide, AgentName
        FROM TBL016
    `);

    return result.recordset;
}

export async function GetAgentChanges(lastVersion: number) {
    const pool = await getConnection();

    const result = await pool
        .request()
        .input("LastVersion", sql.BigInt, lastVersion)
        .query(`
            SELECT
                CT.SYS_CHANGE_VERSION AS ChangeVersion,
                CT.SYS_CHANGE_OPERATION AS ChangeOperation,
                CT.CardGuide,
                T.AgentName

            FROM CHANGETABLE(
                CHANGES dbo.TBL016,
                @LastVersion
            ) AS CT

            LEFT JOIN dbo.TBL016 AS T
                ON T.CardGuide = CT.CardGuide

            ORDER BY CT.SYS_CHANGE_VERSION;
        `);

    return result.recordset;
}


// ==================== WAREHOUSES ====================

export async function GetWarehouses() {
    const pool = await getConnection();

    const result = await pool.request().query(`
        SELECT CardGuide, WarehouseName
        FROM TBL008
    `);

    return result.recordset;
}

export async function GetWarehouseChanges(lastVersion: number) {
    const pool = await getConnection();

    const result = await pool
        .request()
        .input("LastVersion", sql.BigInt, lastVersion)
        .query(`
            SELECT
                CT.SYS_CHANGE_VERSION AS ChangeVersion,
                CT.SYS_CHANGE_OPERATION AS ChangeOperation,
                CT.CardGuide,
                T.WarehouseName

            FROM CHANGETABLE(
                CHANGES dbo.TBL008,
                @LastVersion
            ) AS CT

            LEFT JOIN dbo.TBL008 AS T
                ON T.CardGuide = CT.CardGuide

            ORDER BY CT.SYS_CHANGE_VERSION;
        `);

    return result.recordset;
}


// ==================== CURRENCY ====================

export async function GetCurrency() {
    const pool = await getConnection();

    const result = await pool.request().query(`
        SELECT CardGuide, CurrencyName
        FROM TBL001
    `);

    return result.recordset;
}

export async function GetCurrencyChanges(lastVersion: number) {
    const pool = await getConnection();

    const result = await pool
        .request()
        .input("LastVersion", sql.BigInt, lastVersion)
        .query(`
            SELECT
                CT.SYS_CHANGE_VERSION AS ChangeVersion,
                CT.SYS_CHANGE_OPERATION AS ChangeOperation,
                CT.CardGuide,
                T.CurrencyName

            FROM CHANGETABLE(
                CHANGES dbo.TBL001,
                @LastVersion
            ) AS CT

            LEFT JOIN dbo.TBL001 AS T
                ON T.CardGuide = CT.CardGuide

            ORDER BY CT.SYS_CHANGE_VERSION;
        `);

    return result.recordset;
}