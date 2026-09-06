
"use client";

import { useEffect, useRef, useState } from "react";

type ChangeOperation = "I" | "U" | "D";

type Change<T> = T & {
    ChangeVersion: number;
    ChangeOperation: ChangeOperation;
};

type UseChangeTrackingProps<T> = {
    data: T[];
    getChanges: (
        lastVersion: number
    ) => Promise<{
        success: boolean;
        data?: Change<T>[];
    }>;
    getId: (item: T) => string;
    initialVersion?: number;
    interval?: number;
};

export function useChangeTracking<T>({
    data,
    getChanges,
    getId,
    initialVersion = 0,
    interval = 1000,
}: UseChangeTrackingProps<T>) {

    const [items, setItems] = useState<T[]>(data);

    const lastVersion = useRef(initialVersion);

    useEffect(() => {

        const timer = setInterval(async () => {

            const result = await getChanges(
                lastVersion.current
            );

            if (
                !result.success ||
                !result.data?.length
            ) {
                return;
            }

            setItems(prevItems => {

                let updatedItems = [...prevItems];

                for (const change of result.data!) {

                    const id = getId(change);

                    // INSERT
                    if (
                        change.ChangeOperation === "I"
                    ) {

                        const exists =
                            updatedItems.some(
                                item =>
                                    getId(item) === id
                            );

                        if (!exists) {
                            updatedItems = [
                                change,
                                ...updatedItems,
                            ];
                        }
                    }

                    // UPDATE
                    if (
                        change.ChangeOperation === "U"
                    ) {

                        updatedItems =
                            updatedItems.map(item =>
                                getId(item) === id
                                    ? change
                                    : item
                            );
                    }

                    // DELETE
                    if (
                        change.ChangeOperation === "D"
                    ) {

                        updatedItems =
                            updatedItems.filter(
                                item =>
                                    getId(item) !== id
                            );
                    }
                }

                return updatedItems;
            });

            lastVersion.current =
                result.data[
                    result.data.length - 1
                ].ChangeVersion;

        }, interval);

        return () => {
            clearInterval(timer);
        };

    }, [getChanges, getId, interval]);

    return {
        items,
        setItems,
    };
}

