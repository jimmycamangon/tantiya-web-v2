import { db } from "../../db/database";
import type { Transfer } from "../../types/transfer";
import { toEntryDate } from "../../utils/entryDate";


export async function createTransfer(
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    notes?: string,
    dateKey?: string
): Promise<Transfer> {

    if (amount <= 0) {
        throw new Error(
            "Amount must be greater than zero"
        );
    }

    if (
        fromAccountId ===
        toAccountId
    ) {
        throw new Error(
            "Cannot transfer to the same account"
        );
    }

    const now = new Date();

    const entryDate = toEntryDate(dateKey);

    if (entryDate > now) {
        throw new Error(
            "Date cannot be in the future"
        );
    }

    const transfer: Transfer = {
        id: crypto.randomUUID(),

        fromAccountId,
        toAccountId,

        amount,

        date: entryDate.toISOString(),

        notes,

        isDeleted: false,

        createdAt: now.toISOString(),
    };

    await db.transfers.add(
        transfer
    );

    return transfer;
}


export async function getTransfers() {

    return db.transfers
        .filter(
            transfer =>
                !transfer.isDeleted
        )
        .toArray();
}

export async function softDeleteTransfer(
    transferId: string
): Promise<void> {

    await db.transfers.update(
        transferId,
        {
            isDeleted: true
        }
    );
}


export async function updateTransfer(
    transferId: string,
    updates: Partial<Transfer>
): Promise<void> {

    if (
        updates.amount !== undefined &&
        (!Number.isFinite(updates.amount) || updates.amount <= 0)
    ) {
        throw new Error(
            "Amount must be greater than zero"
        );
    }

    if (
        updates.date !== undefined &&
        new Date(updates.date) > new Date()
    ) {
        throw new Error(
            "Date cannot be in the future"
        );
    }

    await db.transfers.update(
        transferId,
        updates
    );
}