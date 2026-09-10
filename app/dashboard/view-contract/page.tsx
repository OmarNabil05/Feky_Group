import { getContractsAction } from "@/actions/contracts.action";

import ContractTable from "./contract-table";

export default async function ViewContractPage() {

    const result =
        await getContractsAction();

    if (!result.success) {
        return (
            <div className="container mx-auto py-10">
                <p className="text-destructive">
                    Failed to load contracts.
                </p>
            </div>
        );
    }

    const contracts =
        result.data ?? [];

    return (
        <div className="container mx-auto py-10">
            <ContractTable
                data={contracts}
            />
        </div>
    );
}