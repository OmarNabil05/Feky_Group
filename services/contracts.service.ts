import {
    insertContract,
    getAllContracts,
    getContractById,
    updateContract,
    deleteContract,
    getContractChanges
} from "@/repository/contracts.repository";

import type {
    InsertContractData,
} from "@/types/contracts.types";


/* =========================
   CREATE
========================= */

export async function createContract(
    data: InsertContractData
) {
    // Business rules can go here later.

    return await insertContract(data);
}


/* =========================
   GET ALL
========================= */

export async function getContracts() {

    return await getAllContracts();
}


/* =========================
   GET BY ID
========================= */

export async function getContract(
    cardGuide: string
) {

    return await getContractById(cardGuide);
}


/* =========================
   UPDATE
========================= */

export async function editContract(
    cardGuide: string,
    data: InsertContractData
) {

    // Business rules can go here later.

    return await updateContract(cardGuide, data);
}


/* =========================
   DELETE
========================= */

export async function removeContract(
    cardGuide: string
) {

    return await deleteContract(cardGuide);
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