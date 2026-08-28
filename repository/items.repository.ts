import getConnection from "@/lib/db";
import { ItemsSchema } from "@/types/items.types";
import sql from "mssql";

export async function insertItem(item: ItemsSchema) {


    const pool = await getConnection();

    const result = await pool.request().input("ProductName", sql.NVarChar, item.ProductName)
        .input("MinLimit", sql.Float, item.MinLimit)
        .input("MaxLimit", sql.Float, item.MaxLimit)
        .input("Source", sql.NVarChar, item.Source)
        .input("Specification", sql.NVarChar, item.Specification)
        .input("Width", sql.Float, item.Width)
        .input("Hieght", sql.Float, item.Hieght)
        .input("CardImage", sql.VarBinary, item.CardImage)
        .query(`
            INSERT INTO tbl007 (ProductName, MinLimit, MaxLimit, Source, Specification, Width, Hieght, CardImage)
            OUTPUT INSERTED.*
            VALUES (@ProductName, @MinLimit, @MaxLimit, @Source, @Specification, @Width, @Hieght , @CardImage);
        `);

    return result.recordset[0];

}

export async function getItems(offset: number, limit: number) {
    const pool = await getConnection();

    const result = await pool.request()
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
                Hieght ,
                 cardImage
            FROM tbl007
            ORDER BY ID asc
            OFFSET @Offset ROWS 
            FETCH NEXT @Limit ROWS ONLY;
        `);

    return result.recordset;
}



export async function getItemByCardCode(cardCode: string) {
    const pool = await getConnection();

    const result = await pool.request()
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
                Hieght ,
                 cardImage
            FROM tbl007
            WHERE CardCode = @CardCode;
        `);

    return result.recordset[0];
}




export async function searchItems(search: string, limit: number, offset: number) {
    const pool = await getConnection();

    const result = await pool.request()
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
            FROM tbl007
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

    const result = await pool.request()
        .input("CardCode", sql.NVarChar, cardCode)
        .input("ProductName", sql.NVarChar, item.ProductName)
        .input("MinLimit", sql.Float, item.MinLimit)
        .input("MaxLimit", sql.Float, item.MaxLimit)
        .input("Source", sql.NVarChar, item.Source)
        .input("Specification", sql.NVarChar, item.Specification)
        .input("Width", sql.Float, item.Width)
        .input("Hieght", sql.Float, item.Hieght)
        .input("CardImage", sql.VarBinary, item.CardImage)
        .query(`
            UPDATE tbl007
            SET
                ProductName = @ProductName,
                MinLimit = @MinLimit,
                MaxLimit = @MaxLimit,
                Source = @Source,
                Specification = @Specification,
                Width = @Width,
                Hieght = @Hieght,
                CardImage = @CardImage
            OUTPUT INSERTED.*
            WHERE CardCode = @CardCode;
        `);

    return result.recordset[0];
}


export async function deleteItem(cardCode: string) {
    const pool = await getConnection();

    const result = await pool.request()
        .input("CardCode", sql.NVarChar, cardCode)
        .query(`
            DELETE FROM tbl007
            OUTPUT DELETED.*
            WHERE CardCode = @CardCode;
        `);

    return result.recordset[0];
}