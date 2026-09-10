import sql from "mssql";
import { randomUUID } from "crypto";

import getConnection from "@/lib/db";
import { AppError } from "@/utils/AppError";

import type {
    InsertContractData,
    Contract,
    ContractListItem,
} from "@/types/contracts.types";


const MAIN_GUIDE =
    "C2BB2555-AB62-4AFD-B8FF-89DE47642D31";


/* =========================
   INSERT
========================= */

export async function insertContract(
    data: InsertContractData
) {
    const pool = await getConnection();

    const transaction =
        new sql.Transaction(pool);

    await transaction.begin();

    try {
        const cardGuide = randomUUID();

        /* =========================
           INSERT CONTRACT HEADER
        ========================= */

        await new sql.Request(transaction)
            .input(
                "CardGuide",
                sql.UniqueIdentifier,
                cardGuide
            )
            .input(
                "TypeGuide",
                sql.UniqueIdentifier,
                MAIN_GUIDE
            )
            .input(
                "AgentGuide01",
                sql.UniqueIdentifier,
                data.AgentGuide01
            )
            .input(
                "Currency",
                sql.UniqueIdentifier,
                data.Currency
            )
            .input(
                "StoreID",
                sql.UniqueIdentifier,
                data.StoreID
            )
            .input(
                "CardDate",
                sql.DateTime,
                data.CardDate
            )
            .input(
                "ArcheiveName",
                sql.NVarChar(255),
                data.ArcheiveName
            )
            .input(
                "Notes",
                sql.NVarChar(sql.MAX),
                data.Notes
            )
            .query(`
                INSERT INTO dbo.TBL085
                (
                    CardGuide,
                    TypeGuide,
                    AgentGuide01,
                    Currency,
                    Store,
                    CardDate,
                    ArcheiveName,
                    Notes
                )
                VALUES
                (
                    @CardGuide,
                    @TypeGuide,
                    @AgentGuide01,
                    @Currency,
                    @StoreID,
                    @CardDate,
                    @ArcheiveName,
                    @Notes
                );
            `);


        /* =========================
           INSERT CONTRACT PRODUCTS
        ========================= */

        for (const product of data.Products) {
            await new sql.Request(transaction)
                .input(
                    "MainGuide",
                    sql.UniqueIdentifier,
                    cardGuide
                )
                .input(
                    "ItemGuide",
                    sql.UniqueIdentifier,
                    product.ItemGuide
                )
                .input(
                    "Quantity",
                    sql.Decimal(18, 4),
                    product.Quantity
                )
                .input(
                    "Price",
                    sql.Decimal(18, 4),
                    product.Price
                )
                .input(
                    "DeliveryDate",
                    sql.DateTime,
                    product.DeliveryDate
                )
                .query(`
                    INSERT INTO dbo.TBL093
                    (
                        MainGuide,
                        ItemGuide,
                        NumberValue,
                        NumberValue2,
                        Datevalue01,
                        Delivered
                    )
                    VALUES
                    (
                        @MainGuide,
                        @ItemGuide,
                        @Quantity,
                        @Price,
                        @DeliveryDate,
                        0
                    );
                `);
        }


        await transaction.commit();

        return {
            CardGuide: cardGuide,
        };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}


/* =========================
   GET ALL
========================= */

export async function getAllContracts(): Promise<
    ContractListItem[]
> {
    const pool = await getConnection();

    const result = await pool
        .request()
        .input(
            "TypeGuide",
            sql.UniqueIdentifier,
            MAIN_GUIDE
        )
        .query(`
            SELECT
                C.CardGuide,
                C.ArcheiveName,
                A.AgentName,
                W.WarehouseName,
                CU.CurrencyName,
                C.CardDate

            FROM dbo.TBL085 AS C

            LEFT JOIN dbo.TBL016 AS A
                ON A.CardGuide = C.AgentGuide01

            LEFT JOIN dbo.TBL008 AS W
                ON W.CardGuide = C.Store

            LEFT JOIN dbo.TBL001 AS CU
                ON CU.CardGuide = C.Currency

            WHERE
                C.TypeGuide = @TypeGuide

            ORDER BY
                C.CardDate DESC;
        `);

    return result.recordset;
}


/* =========================
   GET BY ID
========================= */

export async function getContractById(
    cardGuide: string
): Promise<Contract> {
    const pool = await getConnection();

    try {
        console.log(
            "[EDIT] Contract ID:",
            cardGuide
        );


        /* =========================
           GET CONTRACT HEADER
        ========================= */

        const headerResult = await pool
            .request()
            .input(
                "CardGuide",
                sql.UniqueIdentifier,
                cardGuide
            )
            .query(`
                SELECT
                    C.CardGuide,

                    C.AgentGuide01,
                    A.AgentName,

                    C.Currency,
                    CU.CurrencyName,

                    C.Store AS StoreID,
                    W.WarehouseName,

                    C.CardDate,
                    C.ArcheiveName,
                    C.Notes

                FROM dbo.TBL085 AS C

                LEFT JOIN dbo.TBL016 AS A
                    ON A.CardGuide = C.AgentGuide01

                LEFT JOIN dbo.TBL008 AS W
                    ON W.CardGuide = C.Store

                LEFT JOIN dbo.TBL001 AS CU
                    ON CU.CardGuide = C.Currency

                WHERE
                    C.CardGuide = @CardGuide;
            `);


        console.log(
            "[EDIT] Header query finished"
        );


        const header =
            headerResult.recordset[0];


        if (!header) {
            throw new AppError(
                "Contract not found",
                404
            );
        }


        /* =========================
           GET CONTRACT PRODUCTS
        ========================= */

        const productsResult = await pool
            .request()
            .input(
                "ContractGuide",
                sql.UniqueIdentifier,
                cardGuide
            )
            .query(`
                SELECT
                    B.ItemGuide,
                    B.NumberValue AS Quantity,
                    B.NumberValue2 AS Price,
                    B.Datevalue01 AS DeliveryDate,
                    B.Delivered

                FROM dbo.TBL093 AS B

                WHERE
                    B.MainGuide = @ContractGuide
                    AND B.ItemGuide IS NOT NULL
                    AND B.Datevalue01 IS NOT NULL;
            `);


        console.log(
            "[EDIT] Products query finished"
        );


        return {
            ...header,

            MainGuide:
                cardGuide,

            Products:
                productsResult.recordset.map(
                    (product) => ({
                        CardGuide: "",

                        ItemGuide:
                            product.ItemGuide,

                        Quantity:
                            product.Quantity,

                        Price:
                            product.Price,

                        DeliveryDate:
                            product.DeliveryDate,

                        Delivered:
                            product.Delivered,
                    })
                ),
        };

    } catch (error) {
        console.error(
            "[EDIT] GET CONTRACT ERROR:",
            error
        );

        throw error;
    }
}


/* =========================
   UPDATE
========================= */

export async function updateContract(
    cardGuide: string,
    data: InsertContractData
) {
    const pool = await getConnection();

    const transaction =
        new sql.Transaction(pool);

    await transaction.begin();

    try {

        /* =========================
           UPDATE CONTRACT HEADER
        ========================= */

        const updateResult =
            await new sql.Request(transaction)
                .input(
                    "CardGuide",
                    sql.UniqueIdentifier,
                    cardGuide
                )
                .input(
                    "AgentGuide01",
                    sql.UniqueIdentifier,
                    data.AgentGuide01
                )
                .input(
                    "Currency",
                    sql.UniqueIdentifier,
                    data.Currency
                )
                .input(
                    "StoreID",
                    sql.UniqueIdentifier,
                    data.StoreID
                )
                .input(
                    "CardDate",
                    sql.DateTime,
                    data.CardDate
                )
                .input(
                    "ArcheiveName",
                    sql.NVarChar(255),
                    data.ArcheiveName
                )
                .input(
                    "Notes",
                    sql.NVarChar(sql.MAX),
                    data.Notes
                )
                .query(`
                    UPDATE dbo.TBL085

                    SET
                        AgentGuide01 = @AgentGuide01,
                        Currency = @Currency,
                        Store = @StoreID,
                        CardDate = @CardDate,
                        ArcheiveName = @ArcheiveName,
                        Notes = @Notes

                    WHERE
                        CardGuide = @CardGuide;
                `);


        if (
            updateResult.rowsAffected[0] === 0
        ) {
            throw new AppError(
                "Contract not found",
                404
            );
        }


        /* =========================
           DELETE OLD PRODUCTS
        ========================= */

        await new sql.Request(transaction)
            .input(
                "ContractGuide",
                sql.UniqueIdentifier,
                cardGuide
            )
            .query(`
                DELETE FROM dbo.TBL093

                WHERE
                    MainGuide = @ContractGuide;
            `);


        /* =========================
           INSERT UPDATED PRODUCTS
        ========================= */

        for (const product of data.Products) {

            await new sql.Request(transaction)
                .input(
                    "MainGuide",
                    sql.UniqueIdentifier,
                    cardGuide
                )
                .input(
                    "ItemGuide",
                    sql.UniqueIdentifier,
                    product.ItemGuide
                )
                .input(
                    "Quantity",
                    sql.Decimal(18, 4),
                    product.Quantity
                )
                .input(
                    "Price",
                    sql.Decimal(18, 4),
                    product.Price
                )
                .input(
                    "DeliveryDate",
                    sql.DateTime,
                    product.DeliveryDate
                )
                .query(`
                    INSERT INTO dbo.TBL093
                    (
                        MainGuide,
                        ItemGuide,
                        NumberValue,
                        NumberValue2,
                        Datevalue01,
                        Delivered
                    )
                    VALUES
                    (
                        @MainGuide,
                        @ItemGuide,
                        @Quantity,
                        @Price,
                        @DeliveryDate,
                        0
                    );
                `);
        }


        await transaction.commit();

        return {
            CardGuide: cardGuide,
        };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}


/* =========================
   DELETE
========================= */

export async function deleteContract(
    cardGuide: string
) {
    const pool = await getConnection();

    const transaction =
        new sql.Transaction(pool);

    await transaction.begin();

    try {

        /* =========================
           CHECK CONTRACT
        ========================= */

        const contractResult =
            await new sql.Request(transaction)
                .input(
                    "CardGuide",
                    sql.UniqueIdentifier,
                    cardGuide
                )
                .query(`
                    SELECT
                        CardGuide

                    FROM dbo.TBL085

                    WHERE
                        CardGuide = @CardGuide;
                `);


        if (
            contractResult.recordset.length === 0
        ) {
            throw new AppError(
                "Contract not found",
                404
            );
        }


        /* =========================
           DELETE PRODUCTS
        ========================= */

        await new sql.Request(transaction)
            .input(
                "ContractGuide",
                sql.UniqueIdentifier,
                cardGuide
            )
            .query(`
                DELETE FROM dbo.TBL093

                WHERE
                    MainGuide = @ContractGuide;
            `);


        /* =========================
           DELETE HEADER
        ========================= */

        await new sql.Request(transaction)
            .input(
                "CardGuide",
                sql.UniqueIdentifier,
                cardGuide
            )
            .query(`
                DELETE FROM dbo.TBL085

                WHERE
                    CardGuide = @CardGuide;
            `);


        await transaction.commit();

        return {
            CardGuide: cardGuide,
        };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}


/* =========================
   CHANGE TRACKING
========================= */

export async function getContractChanges(
    lastVersion: number
) {
    const pool = await getConnection();


    const dbInfo =
        await pool
            .request()
            .query(`
                SELECT
                    @@SERVERNAME AS ServerName,
                    DB_NAME() AS DatabaseName;
            `);


    console.log(
        "[CONTRACT CHANGES DB]",
        dbInfo.recordset[0]
    );


    const result =
        await pool
            .request()
            .input(
                "LastVersion",
                sql.BigInt,
                lastVersion
            )
            .query(`
                SELECT
                    CT.SYS_CHANGE_VERSION
                        AS ChangeVersion,

                    CT.SYS_CHANGE_OPERATION
                        AS ChangeOperation,

                    CT.CardGuide,

                    T.ArcheiveName,
                    T.AgentGuide01,
                    T.Currency,
                    T.Store AS StoreID,
                    T.CardDate,
                    T.Notes

                FROM CHANGETABLE(
                    CHANGES dbo.TBL085,
                    @LastVersion
                ) AS CT

                LEFT JOIN dbo.TBL085 AS T
                    ON T.CardGuide = CT.CardGuide

                ORDER BY
                    CT.SYS_CHANGE_VERSION;
            `);


    return result.recordset;
}