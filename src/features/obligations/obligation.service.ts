import { db } from "../../db/database";
import type { Obligation } from "../../types/obligation";

export async function createObligation(
    name: string,
    amount: number,
    recurrenceType: Obligation["recurrenceType"],
    dueDay: number,
    accountId: string,
    fundingRule: Obligation["fundingRule"]
): Promise<Obligation> {

    if (!name.trim()) {
        throw new Error(
            "Name is required"
        );
    }

    if (amount <= 0) {
        throw new Error(
            "Amount must be greater than zero"
        );
    }
    if (
        dueDay < 1 ||
        dueDay > 31
    ) {
        throw new Error(
            "Due day must be between 1 and 31"
        );
    }
    const obligation: Obligation = {
        id: crypto.randomUUID(),

        name,
        amount,

        recurrenceType,
        dueDay,

        accountId,

        fundingRule,

        active: true,

        createdAt:
            new Date().toISOString(),
    };

    await db.obligations.add(
        obligation
    );

    return obligation;
}


export async function getObligations() {
    return db.obligations
        .filter(
            obligation =>
                obligation.active
        )
        .toArray();
}

export async function deactivateObligation(
    obligationId: string
): Promise<void> {

    await db.obligations.update(
        obligationId,
        {
            active: false
        }
    );
}


export async function updateObligation(
    obligationId: string,
    updates: Partial<Obligation>
): Promise<void> {

    await db.obligations.update(
        obligationId,
        updates
    );
}