"use server";

import {
    createContract,
    getContracts,
    getContract,
    editContract,
    removeContract,
    getContractChange,
    getSchedule,
    deliverProduct,
} from "@/services/contracts.service";

import type {
    InsertContractData,
} from "@/types/contracts.types";


/* =========================
   CREATE CONTRACT
========================= */

export async function createContractAction(
    data: InsertContractData
) {
    try {

        const result =
            await createContract(data);

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
   GET ALL CONTRACTS
========================= */

export async function getContractsAction() {
    try {

        const result =
            await getContracts();

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
   GET CONTRACT BY ID
========================= */

export async function getContractAction(
    cardGuide: string
) {
    try {

        const result =
            await getContract(cardGuide);

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
   UPDATE CONTRACT
========================= */

export async function updateContractAction(
    cardGuide: string,
    data: InsertContractData
) {
    try {

        const result =
            await editContract(
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
   DELETE CONTRACT
========================= */

export async function deleteContractAction(
    cardGuide: string
) {
    try {

        const result =
            await removeContract(
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
            await getContractChange(
                lastVersion
            );

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


/* =========================
   GET CONTRACT SCHEDULE
========================= */

export async function getContractScheduleAction(
    cardGuide: string
) {
    try {

        const result =
            await getSchedule(
                cardGuide
            );

        return {
            success: true,
            data: result,
        };

    } catch (error) {

        console.error(
            "[GET CONTRACT SCHEDULE ACTION ERROR]",
            error
        );

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to load contract schedule",
        };
    }
}


/* =========================
   DELIVER CONTRACT PRODUCT
========================= */

export async function deliverContractProductAction(
    cardGuide: string,
    id: number
) {
    try {

        const result =
            await deliverProduct(
                cardGuide,
                id
            );

        return {
            success: true,
            data: result,
        };

    } catch (error) {

        console.error(
            "[DELIVER CONTRACT PRODUCT ACTION ERROR]",
            error
        );

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to deliver product",
        };
    }
}