import getConnection from "@/lib/db";
import { ItemsSchema } from "@/types/items.types";
import sql from "mssql";

export async function insertItem(item: ItemsSchema) {
    const pool = await getConnection();

    const result = await pool
        .request()
        .input("ProductName", sql.NVarChar, item.ProductName)
        .input("MinLimit", sql.Float, item.MinLimit)
        .input("MaxLimit", sql.Float, item.MaxLimit)
        .input("Source", sql.NVarChar, item.Source)
        .input("Specification", sql.NVarChar, item.Specification)
        .input("Width", sql.Float, item.Width)
        .input("Hieght", sql.Float, item.Hieght)
        .input("CardImage", sql.VarBinary, item.CardImage ?? null)
        .query(`
            DECLARE @NewCardCode NVARCHAR(50);

            SELECT @NewCardCode =
                CAST(
                    ISNULL(
                        MAX(TRY_CONVERT(INT, CardCode)),
                        0
                    ) + 1
                    AS NVARCHAR(50)
                )
            FROM dbo.TBL007;

            INSERT INTO dbo.TBL007 (
                CardCode,
                ProductName,
                MinLimit,
                MaxLimit,
                Source,
                Specification,
                Width,
                Hieght,
                CardImage,
                GroupGuid
            )
            VALUES (
                @NewCardCode,
                @ProductName,
                @MinLimit,
                @MaxLimit,
                @Source,
                @Specification,
                @Width,
                @Hieght,
                @CardImage,
                '679FBA47-E94A-4766-BF8A-6F6605547FF0'
            );

            SELECT CardCode , ProductName , Source , Specification,MinLimit, MaxLimit, Width ,Hieght
            FROM dbo.TBL007
            WHERE CardCode = @NewCardCode;
        `);

    return result.recordset[0];
}


export async function getItems(offset: number, limit: number) {
    const pool = await getConnection();

    const result = await pool
        .request()
        .input("Offset", sql.Int, offset)
        .input("Limit", sql.Int, limit)
        .query(`
            SELECT
                CardCode,
                ProductName,
                MinLimit,
                MaxLimit,
                Source,
                Specification,
                Width,
                Hieght,
                CardImage
            FROM TBL007
            ORDER BY ID ASC
            OFFSET @Offset ROWS
            FETCH NEXT @Limit ROWS ONLY;
        `);

    return result.recordset;
}


export async function getItemByCardCode(cardCode: string) {
    const pool = await getConnection();

    const result = await pool
        .request()
        .input("CardCode", sql.NVarChar, cardCode)
        .query(`
            SELECT
                CardCode,
                ProductName,
                MinLimit,
                MaxLimit,
                Source,
                Specification,
                Width,
                Hieght,
                CardImage
            FROM TBL007
            WHERE CardCode = @CardCode;
        `);

    return result.recordset[0];
}


export async function searchItems(
    search: string,
    limit: number,
    offset: number
) {
    const pool = await getConnection();

    const result = await pool
        .request()
        .input("Search", sql.NVarChar, `${search.trim()}%`)
        .input("Limit", sql.Int, limit)
        .input("Offset", sql.Int, offset)
        .query(`
            SELECT
                CardCode,
                ProductName,
                MinLimit,
                MaxLimit,
                Source,
                Specification,
                Width,
                Hieght
            FROM TBL007
            WHERE ProductName LIKE @Search
               OR CardCode LIKE @Search
            ORDER BY ProductName
            OFFSET @Offset ROWS
            FETCH NEXT @Limit ROWS ONLY;
        `);

    return result.recordset;
}


export async function updateItem(
    cardCode: string,
    item: ItemsSchema
) {
    const pool = await getConnection();

    const result = await pool
        .request()
        .input("CardCode", sql.NVarChar, cardCode)
        .input("ProductName", sql.NVarChar, item.ProductName)
        .input("MinLimit", sql.Float, item.MinLimit)
        .input("MaxLimit", sql.Float, item.MaxLimit)
        .input("Source", sql.NVarChar, item.Source)
        .input("Specification", sql.NVarChar, item.Specification)
        .input("Width", sql.Float, item.Width)
        .input("Hieght", sql.Float, item.Hieght)
        .input("CardImage", sql.VarBinary, item.CardImage ?? null)
        .query(`
            UPDATE TBL007
            SET
                ProductName = @ProductName,
                MinLimit = @MinLimit,
                MaxLimit = @MaxLimit,
                Source = @Source,
                Specification = @Specification,
                Width = @Width,
                Hieght = @Hieght,
                CardImage = @CardImage
            WHERE CardCode = @CardCode;
        `);

    if (result.rowsAffected[0] === 0) {
        return null;
    }

    return {
        CardCode: cardCode,
        ProductName: item.ProductName,
        MinLimit: item.MinLimit,
        MaxLimit: item.MaxLimit,
        Source: item.Source,
        Specification: item.Specification,
        Width: item.Width,
        Hieght: item.Hieght,
        CardImage: item.CardImage ?? null,
    };
}


export async function deleteItem(cardCode: string) {
    const pool = await getConnection();

    const result = await pool
        .request()
        .input("CardCode", sql.NVarChar, cardCode)
        .query(`
            DELETE FROM TBL007
            WHERE CardCode = @CardCode;
        `);

    if (result.rowsAffected[0] === 0) {
        return null;
    }

    return {
        CardCode: cardCode,
    };
}


export async function itemNameExists(productName: string) {
    const pool = await getConnection();

    const result = await pool
        .request()
        .input("ProductName", sql.NVarChar, productName)
        .query(`
            SELECT TOP 1 1 AS ExistsFlag
            FROM TBL007
            WHERE ProductName = @ProductName;
        `);

    return result.recordset.length > 0;
}

export async function getItemsNumber() {
    
    const pool = await getConnection();

    const result = await pool.request().query('select count(productName) from TBL007');

    return result;
}