import type { Obligation }
    from "../../types/obligation";

import {
    getObligationDueInfo
} from "./obligationSchedule";

/**
 * Sums the amounts that should be set aside for
 * obligations due within the next 7 days (or overdue),
 * skipping obligations already paid for the period.
 */
export function calculateReservedAmount(
    obligations: Obligation[],
    paidPeriodKeys: Map<string, Set<string>>
): number {

    return obligations.reduce(
        (total, obligation) => {

            const dueInfo =
                getObligationDueInfo(
                    obligation,
                    paidPeriodKeys.get(
                        obligation.id
                    ) ?? new Set()
                );

            if (
                !dueInfo.paidForCurrentPeriod &&
                dueInfo.daysUntilDue <= 7
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
