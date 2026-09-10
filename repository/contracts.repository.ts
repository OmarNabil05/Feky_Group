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

/* =========================================================
   INSERT CONTRACT
========================================================= */

export async function insertContract(
    data: InsertContractData
) {
    const pool = await getConnection();

    const transaction =
        new sql.Transaction(pool);

    await transaction.begin();

    try {
        const cardGuide = randomUUID();

        /* =====================================================
           INSERT CONTRACT HEADER
        ===================================================== */

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

        /* =====================================================
           INSERT CONTRACT PRODUCTS
        ===================================================== */

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
                    "Total",
                    sql.Decimal(18, 4),
                    data.Total
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
                        NumberValue3,
                        Datevalue01,
                        Delivered
                    )
                    VALUES
                    (
                        @MainGuide,
                        @ItemGuide,
                        @Quantity,
                        @Price,
                        @Total,
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

/* =========================================================
   GET ALL CONTRACTS
========================================================= */

export async function getAllContracts(): Promise<
    ContractListItem[]
> {
    const pool = await getConnection();

    const result =
        await pool
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

                    C.CardDate,

                    C.Status,

                    (
                        SELECT TOP 1
                            B.NumberValue3
                        FROM dbo.TBL093 AS B
                        WHERE
                            B.MainGuide = C.CardGuide
                            AND B.ItemGuide IS NOT NULL
                    ) AS Total

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

    return result.recordset.map(
        (contract) => ({
            CardGuide:
                contract.CardGuide,

            ArcheiveName:
                contract.ArcheiveName,

            AgentName:
                contract.AgentName,

            WarehouseName:
                contract.WarehouseName,

            CurrencyName:
                contract.CurrencyName,

            CardDate:
                contract.CardDate,

            /*
               SQL Server BIT can come back from mssql
               as boolean.

               Application type expects:
               0 = not finished
               1 = finished
            */
            Status:
                Number(contract.Status ?? 0),

            Total:
                Number(contract.Total ?? 0),
        })
    );
}

/* =========================================================
   GET CONTRACT BY ID
========================================================= */

export async function getContractById(
    cardGuide: string
): Promise<Contract> {
    const pool = await getConnection();

    try {
        /* =====================================================
           HEADER
        ===================================================== */

        const headerResult =
            await pool
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
                        C.Notes,

                        C.Status

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

        const header =
            headerResult.recordset[0];

        if (!header) {
            throw new AppError(
                "Contract not found",
                404
            );
        }

        /* =====================================================
           PRODUCTS
        ===================================================== */

        const productsResult =
            await pool
                .request()
                .input(
                    "ContractGuide",
                    sql.UniqueIdentifier,
                    cardGuide
                )
                .query(`
                    SELECT
                        B.ID,

                        B.ItemGuide,

                        I.ProductName,

                        B.NumberValue AS Quantity,

                        B.NumberValue2 AS Price,

                        B.NumberValue3 AS Total,

                        B.Datevalue01 AS DeliveryDate,

                        B.Delivered

                    FROM dbo.TBL093 AS B

                    LEFT JOIN dbo.TBL007 AS I
                        ON I.CardGuide = B.ItemGuide

                    WHERE
                        B.MainGuide = @ContractGuide

                        AND B.ItemGuide IS NOT NULL

                    ORDER BY
                        B.Datevalue01,
                        B.ID;
                `);

        const products =
            productsResult.recordset;

        const total =
            products.length > 0
                ? Number(products[0].Total ?? 0)
                : 0;

        return {
            CardGuide:
                header.CardGuide,

            AgentGuide01:
                header.AgentGuide01,

            AgentName:
                header.AgentName,

            Currency:
                header.Currency,

            CurrencyName:
                header.CurrencyName,

            StoreID:
                header.StoreID,

            WarehouseName:
                header.WarehouseName,

            CardDate:
                header.CardDate,

            ArcheiveName:
                header.ArcheiveName,

            Notes:
                header.Notes,

            /*
               Normalize SQL BIT → number
            */
            Status:
                Number(header.Status ?? 0),

            Total:
                total,

            MainGuide:
                cardGuide,

            Products:
                products.map(
                    (product) => ({
                        ID:
                            product.ID,

                        CardGuide:
                            cardGuide,

                        ItemGuide:
                            product.ItemGuide,

                        Quantity:
                            Number(
                                product.Quantity ?? 0
                            ),

                        Price:
                            Number(
                                product.Price ?? 0
                            ),

                        DeliveryDate:
                            product.DeliveryDate,

                        Delivered:
                            Boolean(
                                product.Delivered
                            ),
                    })
                ),
        };
    } catch (error) {
        console.error(
            "[GET CONTRACT ERROR]",
            error
        );

        throw error;
    }
}

/* =========================================================
   UPDATE CONTRACT
========================================================= */

export async function updateContract(
    cardGuide: string,
    data: InsertContractData
) {
    const pool = await getConnection();

    const transaction =
        new sql.Transaction(pool);

    await transaction.begin();

    try {
        /* =====================================================
           UPDATE HEADER
        ===================================================== */

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

                        Notes = @Notes,

                        /*
                           Editing the contract recreates
                           its products as undelivered.

                           Therefore the contract must become
                           unfinished again.
                        */
                        Status = 0

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

        /* =====================================================
           DELETE OLD PRODUCTS
        ===================================================== */

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

        /* =====================================================
           INSERT NEW PRODUCTS
        ===================================================== */

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
                    "Total",
                    sql.Decimal(18, 4),
                    data.Total
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
                        NumberValue3,
                        Datevalue01,
                        Delivered
                    )
                    VALUES
                    (
                        @MainGuide,
                        @ItemGuide,
                        @Quantity,
                        @Price,
                        @Total,
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

/* =========================================================
   DELETE CONTRACT
========================================================= */

export async function deleteContract(
    cardGuide: string
) {
    const pool = await getConnection();

    const transaction =
        new sql.Transaction(pool);

    await transaction.begin();

    try {
        /* =====================================================
           CHECK CONTRACT
        ===================================================== */

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

        /* =====================================================
           DELETE PRODUCTS
        ===================================================== */

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

        /* =====================================================
           DELETE HEADER
        ===================================================== */

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

export async function getContractChanges(lastVersion: number) {
    const pool = await getConnection();

    const result =
        await pool
            .request()
            .input("LastVersion", sql.BigInt, lastVersion)
            .input("TypeGuide", sql.UniqueIdentifier, MAIN_GUIDE)
            .query(`
                SELECT
                    CT.SYS_CHANGE_VERSION AS ChangeVersion,
                    CT.SYS_CHANGE_OPERATION AS ChangeOperation,
                    CT.CardGuide,

                    T.ArcheiveName,
                    T.CardDate,
                    T.Status,

                    A.AgentName,
                    W.WarehouseName,
                    CU.CurrencyName,

                    (
                        SELECT TOP 1
                            B.NumberValue3
                        FROM dbo.TBL093 AS B
                        WHERE
                            B.MainGuide = T.CardGuide
                            AND B.ItemGuide IS NOT NULL
                        ORDER BY
                            B.ID
                    ) AS Total

                FROM CHANGETABLE(
                    CHANGES dbo.TBL085,
                    @LastVersion
                ) AS CT

                LEFT JOIN dbo.TBL085 AS T
                    ON T.CardGuide = CT.CardGuide

                LEFT JOIN dbo.TBL016 AS A
                    ON A.CardGuide = T.AgentGuide01

                LEFT JOIN dbo.TBL008 AS W
                    ON W.CardGuide = T.Store

                LEFT JOIN dbo.TBL001 AS CU
                    ON CU.CardGuide = T.Currency

                WHERE
                    (
                        T.TypeGuide = @TypeGuide
                        OR
                        CT.SYS_CHANGE_OPERATION = 'D'
                    )

                ORDER BY
                    CT.SYS_CHANGE_VERSION;
            `);

    return result.recordset.map((contract) => ({
        ...contract,
        Status: Number(contract.Status ?? 0),
        Total: Number(contract.Total ?? 0),
    }));
}
/* =========================================================
   GET CONTRACT SCHEDULE
========================================================= */

export async function getContractSchedule(
    cardGuide: string
) {
    const pool = await getConnection();

    const result =
        await pool
            .request()
            .input(
                "ContractGuide",
                sql.UniqueIdentifier,
                cardGuide
            )
            .query(`
                SELECT
                    B.ID,

                    B.ItemGuide,

                    I.ProductName,

                    B.NumberValue AS Quantity,

                    B.NumberValue2 AS Price,

                    B.Datevalue01 AS DeliveryDate,

                    B.Delivered

                FROM dbo.TBL093 AS B

                LEFT JOIN dbo.TBL007 AS I
                    ON I.CardGuide = B.ItemGuide

                WHERE
                    B.MainGuide = @ContractGuide

                    AND B.ItemGuide IS NOT NULL

                ORDER BY
                    B.Datevalue01,
                    B.ID;
            `);

    return result.recordset.map(
        (product) => ({
            ID:
                product.ID,

            ItemGuide:
                product.ItemGuide,

            ProductName:
                product.ProductName,

            Quantity:
                Number(
                    product.Quantity ?? 0
                ),

            Price:
                Number(
                    product.Price ?? 0
                ),

            DeliveryDate:
                product.DeliveryDate,

            Delivered:
                Boolean(
                    product.Delivered
                ),
        })
    );
}

/* =========================================================
   DELIVER CONTRACT PRODUCT
========================================================= */

export async function deliverContractProduct(
    cardGuide: string,
    id: number
) {
    const pool = await getConnection();

    const transaction =
        new sql.Transaction(pool);

    await transaction.begin();

    try {
        /* =====================================================
           CHECK CONTRACT
        ===================================================== */

        const contractResult =
            await new sql.Request(transaction)
                .input(
                    "CardGuide",
                    sql.UniqueIdentifier,
                    cardGuide
                )
                .query(`
                    SELECT
                        CardGuide,
                        Status

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

        const contract =
            contractResult.recordset[0];

        /*
           Normalize SQL BIT → number.
        */
        const contractFinished =
            Number(
                contract.Status ?? 0
            ) === 1;

        if (contractFinished) {
            throw new AppError(
                "Contract is already finished",
                400
            );
        }

        /* =====================================================
           FIND PRODUCT
        ===================================================== */

        const productResult =
            await new sql.Request(transaction)
                .input(
                    "ContractGuide",
                    sql.UniqueIdentifier,
                    cardGuide
                )
                .input(
                    "ID",
                    sql.Int,
                    id
                )
                .query(`
                    SELECT
                        ID,

                        ItemGuide,

                        Delivered

                    FROM dbo.TBL093

                    WHERE
                        ID = @ID

                        AND MainGuide = @ContractGuide

                        AND ItemGuide IS NOT NULL;
                `);

        if (
            productResult.recordset.length === 0
        ) {
            throw new AppError(
                "Product was not found",
                404
            );
        }

        const product =
            productResult.recordset[0];

        const alreadyDelivered =
            Boolean(
                product.Delivered
            );

        if (alreadyDelivered) {
            throw new AppError(
                "Product is already delivered",
                400
            );
        }

        /* =====================================================
           MARK PRODUCT AS DELIVERED
        ===================================================== */

        const updateResult =
            await new sql.Request(transaction)
                .input(
                    "ContractGuide",
                    sql.UniqueIdentifier,
                    cardGuide
                )
                .input(
                    "ID",
                    sql.Int,
                    id
                )
                .query(`
                    UPDATE dbo.TBL093

                    SET
                        Delivered = 1

                    WHERE
                        ID = @ID

                        AND MainGuide = @ContractGuide

                        AND ItemGuide IS NOT NULL

                        AND ISNULL(
                            Delivered,
                            0
                        ) = 0;
                `);

        if (
            updateResult.rowsAffected[0] === 0
        ) {
            throw new AppError(
                "Product could not be delivered",
                400
            );
        }

        /* =====================================================
           CREATE BILL
        ===================================================== */

        await new sql.Request(transaction)
            .input(
                "archive_guide",
                sql.UniqueIdentifier,
                cardGuide
            )
            .execute(
                "dbo.add_bill_contarcts"
            );

        /* =====================================================
           COUNT PENDING PRODUCTS
        ===================================================== */

        const pendingResult =
            await new sql.Request(transaction)
                .input(
                    "ContractGuide",
                    sql.UniqueIdentifier,
                    cardGuide
                )
                .query(`
                    SELECT
                        COUNT(*) AS PendingCount

                    FROM dbo.TBL093

                    WHERE
                        MainGuide = @ContractGuide

                        AND ItemGuide IS NOT NULL

                        AND ISNULL(
                            Delivered,
                            0
                        ) = 0;
                `);

        const pendingCount =
            Number(
                pendingResult.recordset[0]
                    .PendingCount
            );

        /* =====================================================
           COUNT REAL PRODUCTS
        ===================================================== */

        const productsResult =
            await new sql.Request(transaction)
                .input(
                    "ContractGuide",
                    sql.UniqueIdentifier,
                    cardGuide
                )
                .query(`
                    SELECT
                        COUNT(*) AS ProductCount

                    FROM dbo.TBL093

                    WHERE
                        MainGuide = @ContractGuide

                        AND ItemGuide IS NOT NULL;
                `);

        const productCount =
            Number(
                productsResult.recordset[0]
                    .ProductCount
            );

        /* =====================================================
           FINISH CONTRACT
        ===================================================== */

        let finished = false;

        /*
           IMPORTANT BUSINESS RULE:

           Only real product rows count.

           Real product:
               ItemGuide IS NOT NULL

           Contract is finished when:

               ProductCount > 0
               AND PendingCount = 0
        */

        if (
            productCount > 0 &&
            pendingCount === 0
        ) {
            const statusResult =
                await new sql.Request(transaction)
                    .input(
                        "CardGuide",
                        sql.UniqueIdentifier,
                        cardGuide
                    )
                    .query(`
                        UPDATE dbo.TBL085

                        SET
                            Status = 1

                        WHERE
                            CardGuide = @CardGuide

                            AND ISNULL(
                                Status,
                                0
                            ) = 0;
                    `);

            /*
               Even if Status was already 1,
               the contract is logically finished.
            */
            finished =
                statusResult.rowsAffected[0] > 0 ||
                true;
        }

        /* =====================================================
           COMMIT
        ===================================================== */

        await transaction.commit();

        return {
            CardGuide:
                cardGuide,

            ID:
                id,

            Delivered:
                true,

            Finished:
                finished,
        };
    } catch (error) {
        console.error(
            "[DELIVER CONTRACT PRODUCT ERROR]",
            error
        );

        await transaction.rollback();

        throw error;
    }
}