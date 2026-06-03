import type { Obligation }
    from "../../types/obligation";

import {
    getDaysUntilDue
} from "./getDaysUntilDue";

import {
    getObligationStatus
} from "./getObligationStatus";

export function calculateReservedAmount(
    obligations: Obligation[]
): number {

    return obligations.reduce(
        (total, obligation) => {

            const daysUntilDue =
                getDaysUntilDue(
                    obligation.dueDay
                );

            const status =
                getObligationStatus(
                    daysUntilDue
                );

            if (
                status ===
                    "Prepare Funds" ||
                status ===
                    "Due Soon"
            ) {
                return (
                    total +
                    obligation.amount
                );
            }

            return total;
        },
        0
    );
}