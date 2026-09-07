
import {
    getAgents,
    getAgentChanges,
    getCurrency,
    getCurrencyChanges,
    getWarehouses,
    getWarehouseChanges,
} from "@/services/BasicFunctions/Service-Basics";

import { withErrorHandler } from "@/utils/witherrorhandler";


// ==================== AGENTS ====================

export async function GETAgents() {
    return withErrorHandler(() => getAgents());
}

export async function GETAgentChanges(lastVersion: number) {
    return withErrorHandler(() =>
        getAgentChanges(lastVersion)
    );
}


// ==================== CURRENCY ====================

export async function GETCurrency() {
    return withErrorHandler(() => getCurrency());
}

export async function GETCurrencyChanges(lastVersion: number) {
    return withErrorHandler(() =>
        getCurrencyChanges(lastVersion)
    );
}


// ==================== WAREHOUSES ====================

export async function GETWarehouses() {
    return withErrorHandler(() => getWarehouses());
}

export async function GETWarehouseChanges(lastVersion: number) {
    return withErrorHandler(() =>
        getWarehouseChanges(lastVersion)
    );
}

