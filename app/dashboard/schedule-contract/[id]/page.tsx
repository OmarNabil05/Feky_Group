
import {
    getContractAction,
    getContractScheduleAction,
} from "@/actions/contracts.action";

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

    const contractResult = await getContractAction(id);
    const scheduleResult = await getContractScheduleAction(id);

    if (!contractResult.success || !contractResult.data) {
        console.error(
            "SCHEDULE CONTRACT HEADER ERROR:",
            contractResult
        );

        return (
            <div className="container mx-auto max-w-4xl py-10">
                <p className="text-destructive">
                    Failed to load contract.
                </p>
            </div>
        );
    }

    if (!scheduleResult.success || !scheduleResult.data) {
        console.error(
            "SCHEDULE CONTRACT PRODUCTS ERROR:",
            scheduleResult
        );

        return (
            <div className="container mx-auto max-w-4xl py-10">
                <p className="text-destructive">
                    Failed to load contract products.
                </p>
            </div>
        );
    }

    return (
        <ScheduleContractClient
            contract={contractResult.data}
            schedule={scheduleResult.data}
        />
    );
}
