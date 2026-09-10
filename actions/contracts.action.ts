"use server";

import {
    createContract,
    getContracts,
    getContract,
    editContract,
    removeContract,
    getContractChange,
} from "@/services/contracts.service";

import type {
    InsertContractData,
} from "@/types/contracts.types";


/* =========================
   CREATE
========================= */

export async function createContractAction(
    data: InsertContractData
) {
    try {
        const result = await createContract(data);

        return {
            success: true,
            data: result,
        };

    } catch (error) {

        console.error(
            "[CREATE CONTRACT ACTION ERROR]",
            error
        );

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to create contract",
        };
    }
}


/* =========================
   GET ALL
========================= */

export async function getContractsAction() {
    try {
        const result = await getContracts();

        return {
            success: true,
            data: result,
        };

    } catch (error) {

        console.error(
            "[GET CONTRACTS ACTION ERROR]",
            error
        );

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to load contracts",
        };
    }
}


/* =========================
   GET BY ID
========================= */

export async function getContractAction(
    cardGuide: string
) {
    try {

        console.log(
            "[GET CONTRACT ACTION] ID:",
            cardGuide
        );

        const result = await getContract(cardGuide);

        console.log(
            "[GET CONTRACT ACTION] SUCCESS"
        );

        return {
            success: true,
            data: result,
        };

    } catch (error) {

        console.error(
            "[GET CONTRACT ACTION ERROR]",
            error
        );

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to load contract",
        };
    }
}


/* =========================
   UPDATE
========================= */

export async function updateContractAction(
    cardGuide: string,
    data: InsertContractData
) {
    try {

        const result = await editContract(
            cardGuide,
            data
        );

        return {
            success: true,
            data: result,
        };

    } catch (error) {

        console.error(
            "[UPDATE CONTRACT ACTION ERROR]",
            error
        );

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to update contract",
        };
    }
}


/* =========================
   DELETE
========================= */

export async function deleteContractAction(
    cardGuide: string
) {
    try {

        const result = await removeContract(
            cardGuide
        );

        return {
            success: true,
            data: result,
        };

    } catch (error) {

        console.error(
            "[DELETE CONTRACT ACTION ERROR]",
            error
        );

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to delete contract",
        };
    }
}


/* =========================
   CHANGE TRACKING
========================= */

export async function GetContractChanges(
    lastVersion: number
) {
    try {

        const result =
            await getContractChange(lastVersion);

        return {
            success: true,
            data: result,
        };

    } catch (error) {

        console.error(
            "[GET CONTRACT CHANGES ACTION ERROR]",
            error
        );

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to get contract changes",
        };
    }
}