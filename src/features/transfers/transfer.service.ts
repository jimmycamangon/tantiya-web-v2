import { db } from "../../db/database";
import type { Transfer } from "../../types/transfer";


export async function createTransfer(
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    notes?: string
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

    const transfer: Transfer = {
        id: crypto.randomUUID(),

        fromAccountId,
        toAccountId,

        amount,

        date: now.toISOString(),

        notes,

        isDeleted: false,

        createdAt: now.toISOString(),
    };

    await db.transfers.add(
        transfer
    );

    return transfer;
}