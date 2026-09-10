"use client";

import { useRouter } from "next/navigation";

import DataTable, {
    type ColumnHeaders,
} from "@/components/ui/data-table";

import { Badge } from "@/components/ui/badge";

import type {
    ContractListItem,
} from "@/types/contracts.types";

import {
    GetContractChanges,
    deleteContractAction,
} from "@/actions/contracts.action";

import { useChangeTracking } from "@/hooks/useChangeTracking";


// =========================================================
// CONTRACT COLUMNS
// =========================================================

const ColumnsKeys: ColumnHeaders<ContractListItem>[] = [

    {
        Header: "Contract Name",
        Accessor: "ArcheiveName",
    },

    {
        Header: "Agent",
        Accessor: "AgentName",
    },

    {
        Header: "Warehouse",
        Accessor: "WarehouseName",
    },

    {
        Header: "Currency",
        Accessor: "CurrencyName",
    },

    {
        Header: "Date",
        Accessor: "CardDate",
    },

    {
        Header: "Total",
        Accessor: "Total",
    },

    {
        Header: "Finished",

        Accessor: "Status",

        Cell: (value) => (

            <Badge
                variant={
                    value === 1
                        ? "default"
                        : "secondary"
                }
            >
                {value === 1
                    ? "Finished"
                    : "Not Finished"}
            </Badge>

        ),
    },
];


// =========================================================
// PROPS
// =========================================================

type ContractTableProps = {
    data: ContractListItem[];
};


// =========================================================
// CONTRACT TABLE
// =========================================================

export default function ContractTable({
    data,
}: ContractTableProps) {

    const router =
        useRouter();


    // =====================================================
    // CHANGE TRACKING
    // =====================================================

    const {
        items: Contracts,
    } = useChangeTracking({

        data,

        getChanges:
            GetContractChanges,

        getId:
            (contract) =>
                contract.CardGuide,
    });


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <DataTable<ContractListItem>

            ColumnHeaders={
                ColumnsKeys
            }

            data={
                Contracts
            }

            getRowId={
                (contract) =>
                    contract.CardGuide
            }

            features={{

                search: true,

                sorting: true,

                pagination: true,

                selection: true,

                export: true,

                columnVisibility: true,

                actions: true,

                copy: true,

                view: false,

                edit: false,

                delete: true,

                create: false,

            }}

            customActions={[

                {
                    label: "View",

                    onClick: (contract) => {

                        router.push(
                            `/dashboard/define-contract/${contract.CardGuide}?mode=view`
                        );

                    },
                },

                {
                    label: "Edit",

                    onClick: (contract) => {

                        router.push(
                            `/dashboard/define-contract/${contract.CardGuide}`
                        );

                    },
                },

                {
                    label: "Schedule",

                    onClick: (contract) => {

                        router.push(
                            `/dashboard/schedule-contract/${contract.CardGuide}`
                        );

                    },
                },

            ]}

            onDelete={
                (contract) =>
                    deleteContractAction(
                        contract.CardGuide
                    )
            }

        />

    );
}