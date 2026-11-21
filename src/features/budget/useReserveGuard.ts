import { useCallback } from "react";

import { useConfirmDialog } from "../../components/AppFeedback";
import { getReserveConflict } from "./budgetSnapshot";

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
    }).format(amount);
}

/**
 * Asks the user to confirm before an expense uses money that is
 * reserved for upcoming bills or other budgets. Resolves true to continue.
 */
export function useReserveGuard() {

    const confirm = useConfirmDialog();

    return useCallback(
        async (
            accountId: string,
            amount: number,
            categoryId?: string,
            alreadyDeducted = 0
        ): Promise<boolean> => {

            const conflict = await getReserveConflict(
                accountId,
                amount,
                alreadyDeducted,
                categoryId
            );

            if (!conflict) {
                return true;
            }

            const reservedFor = conflict.reservedFor.length > 0
                ? conflict.reservedFor.join(", ")
                : "upcoming bills";

            return confirm({
                title: "Use money set aside for bills?",
                message:
                    `${conflict.accountName} has ${formatCurrency(conflict.freeAmount)} free. ` +
                    `The rest (${formatCurrency(conflict.reservedAmount)}) is set aside for ${reservedFor}.`,
                confirmLabel: "Spend anyway",
                tone: "warning",
            });
        },
        [confirm]
    );
}
