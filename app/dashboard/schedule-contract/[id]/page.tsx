import { getContractAction } from "@/actions/contracts.action";
import ScheduleContractClient from "./schedule-contract-client";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function ScheduleContractPage({
    params,
}: PageProps) {
    const { id } = await params;

    const result = await getContractAction(id);

    if (!result.success || !result.data) {
        console.error("SCHEDULE CONTRACT ERROR:", result);

        return (
            <div className="container mx-auto max-w-4xl py-10">
                Failed to load contract.
            </div>
        );
    }

    return (
        <ScheduleContractClient
            contract={result.data}
        />
    );
}