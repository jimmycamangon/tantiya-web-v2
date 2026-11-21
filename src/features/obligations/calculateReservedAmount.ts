import type { Obligation }
    from "../../types/obligation";

import { computeReservations } from "./obligationReserve";

/**
 * Sums the money that must already be set aside for unpaid
 * obligations, based on each obligation's funding rule.
 * See obligationReserve.ts for the cutoff rules.
 */
export function calculateReservedAmount(
    obligations: Obligation[],
    paidPeriodKeys: Map<string, Set<string>>
): number {

    return computeReservations(
        obligations,
        paidPeriodKeys
    ).reservedNow;
}
