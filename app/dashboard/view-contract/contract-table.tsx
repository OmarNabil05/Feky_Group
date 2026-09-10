
"use client"

import { useRouter } from "next/navigation"

import DataTable from "@/components/ui/data-table"

import {
    ColumnsKeys,
    type ContractListItem,
} from "@/types/contracts.types"

import {
    GetContractChanges,
    deleteContractAction,
} from "@/actions/contracts.action"

import {
    useChangeTracking,
} from "@/hooks/useChangeTracking"

type ContractTableProps = {
    data: ContractListItem[]
}

export default function ContractTable({
    data,
}: ContractTableProps) {

    const router = useRouter()

    const {
        items: Contracts,
    } = useChangeTracking({
        data,

        getChanges:
            GetContractChanges,

        getId:
            contract =>
                contract.CardGuide,
    })

    return (
        <DataTable<ContractListItem>
            ColumnHeaders={ColumnsKeys}

            data={Contracts}

            getRowId={(contract) =>
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
                        console.log(
                            "View contract:",
                            contract.CardGuide
                        )
                    },
                },

                {
                    label: "Edit",

                    onClick: (contract) => {
                        router.push(
                            `/dashboard/define-contract/${contract.CardGuide}`
                        )
                    },
                },

                {
                    label: "Schedule",

                    onClick: (contract) => {
                        router.push(
                            `/dashboard/schedule-contract/${contract.CardGuide}`
                        )
                    },
                },
            ]}

            onDelete={(contract) =>
                deleteContractAction(
                    contract.CardGuide
                )
            }
        />
    )
}

