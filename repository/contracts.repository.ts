import getConnection from "@/lib/db";

export async function GetAgents() {

    // making the connection here 
    const pool = await getConnection();

    // hageebb el agents 
    const result = pool.request().query(
        `
        select cardguide , AgentName from TBL016 
        `
    );

    return result;



}