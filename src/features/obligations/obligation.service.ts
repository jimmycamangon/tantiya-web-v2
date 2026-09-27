import { db } from "../../db/database";
import type { Obligation } from "../../types/obligation";

/** Yearly obligations need a month (1-12). */
function validateDueMonth(
    recurrenceType: Obligation["recurrenceType"],
    dueMonth?: number
): void {

    if (recurrenceType !== "yearly") {
        return;
    }

    if (
        dueMonth === undefined ||
        !Number.isInteger(dueMonth) ||
        dueMonth < 1 ||
        dueMonth > 12
    ) {
        throw new Error("Choose a due month");
    }
}

/** Weekly obligations use 1 (Mon) to 7 (Sun); others use a day of month. */
function validateDueDay(
    recurrenceType: Obligation["recurrenceType"],
    dueDay: number
): void {

    const max = recurrenceType === "weekly" ? 7 : 31;

    if (
        !Number.isInteger(dueDay) ||
        dueDay < 1 ||
        dueDay > max
    ) {
        throw new Error(
            recurrenceType === "weekly"
                ? "Choose a day of the week"
                : "Due day must be between 1 and 31"
        );
    }
}

export async function createObligation(
    name: string,
    amount: number,
    recurrenceType: Obligation["recurrenceType"],
    dueDay: number,
    accountId: string,
    fundingRule: Obligation["fundingRule"],
    dueMonth?: number
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
    validateDueDay(recurrenceType, dueDay);
    validateDueMonth(recurrenceType, dueMonth);
    const obligation: Obligation = {
        id: crypto.randomUUID(),

        name: name.trim(),
        amount,

        recurrenceType,
        dueDay,
        dueMonth:
            recurrenceType === "yearly"
                ? dueMonth
                : undefined,

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

    const existing = await db.obligations.get(obligationId);

    if (!existing) {
        throw new Error("Obligation not found");
    }

    if (updates.name !== undefined) {
        if (!updates.name.trim()) {
            throw new Error("Name is required");
        }

        updates.name = updates.name.trim();
    }

    if (
        updates.amount !== undefined &&
        (!Number.isFinite(updates.amount) || updates.amount <= 0)
    ) {
        throw new Error(
            "Amount must be greater than zero"
        );
    }

    if (updates.dueDay !== undefined) {
        validateDueDay(
            updates.recurrenceType ?? existing.recurrenceType,
            updates.dueDay
        );
    }

    if (updates.dueMonth !== undefined) {
        validateDueMonth(
            updates.recurrenceType ?? existing.recurrenceType,
            updates.dueMonth
        );
    }

    await db.obligations.update(
        obligationId,
        updates
    );
}