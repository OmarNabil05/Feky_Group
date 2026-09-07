import {
    GetAgents,
    GetAgentChanges,
    GetCurrency,
    GetCurrencyChanges,
    GetWarehouses,
    GetWarehouseChanges
} from "@/repository/BasicFunctions/Repo-Basics";

export async function getAgents() {
    const result = await GetAgents();

    return result;
}

export async function getAgentChanges(lastVersion: number) {
    const result = await GetAgentChanges(lastVersion);

    return result;
}

export async function getWarehouses() {
    const result = await GetWarehouses();

    return result;
}

export async function getWarehouseChanges(lastVersion: number) {
    const result = await GetWarehouseChanges(lastVersion);

    return result;
}

export async function getCurrency() {
    const result = await GetCurrency();

    return result;
}

export async function getCurrencyChanges(lastVersion: number) {
    const result = await GetCurrencyChanges(lastVersion);

    return result;
}