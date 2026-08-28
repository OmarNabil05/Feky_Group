import sql from "mssql";

const config: sql.config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER!,
    database: process.env.DB_DATABASE,
    port: Number(process.env.DB_PORT),

    options: {
        trustServerCertificate: true,
        encrypt: false,
    },
};

export default async function getConnection() {
    return await sql.connect(config);
}