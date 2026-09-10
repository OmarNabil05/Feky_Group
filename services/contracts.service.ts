
import {
    insertContract,
    getAllContracts,
    getContractById,
    updateContract,
    deleteContract,
    getContractChanges,
    getContractSchedule,
    deliverContractProduct,
} from "@/repository/contracts.repository";

import type {
    InsertContractData,
} from "@/types/contracts.types";


/* =========================
   CREATE CONTRACT
========================= */

export async function createContract(
    data: InsertContractData
) {
    // Business rules can be added here later.

    return await insertContract(data);
}


/* =========================
   GET ALL CONTRACTS
========================= */

export async function getContracts() {

    return await getAllContracts();
}


/* =========================
   GET CONTRACT BY ID
========================= */

export async function getContract(
    cardGuide: string
) {

    return await getContractById(
        cardGuide
    );
}


/* =========================
   UPDATE CONTRACT
========================= */

export async function editContract(
    cardGuide: string,
    data: InsertContractData
) {
    // Business rules can be added here later.

    return await updateContract(
        cardGuide,
        data
    );
}


/* =========================
   DELETE CONTRACT
========================= */

export async function removeContract(
    cardGuide: string
) {

    return await deleteContract(
        cardGuide
    );
}


/* =========================
   CHANGE TRACKING
========================= */

export async function getContractChange(
    lastVersion: number
) {

    return await getContractChanges(
        lastVersion
    );
}


/* =========================
   GET CONTRACT SCHEDULE
========================= */

export async function getSchedule(
    cardGuide: string
) {

    return await getContractSchedule(
        cardGuide
    );
}


/* =========================
   DELIVER CONTRACT PRODUCT
========================= */

export async function deliverProduct(
    cardGuide: string,
    id: number
) {

    return await deliverContractProduct(
        cardGuide,
        id
    );
}

