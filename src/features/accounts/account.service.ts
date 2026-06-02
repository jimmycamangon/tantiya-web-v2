import { db } from "../../db/database";
import type { Account } from "../../types/account";

export async function createAccount(
    name: string,
    openingBalance: number
): Promise<Account> {
    const account: Account = {
        id: crypto.randomUUID(),
        name,
        archived: false,
        createdAt: new Date().toISOString(),
    };

    const existingAccount = await db.accounts
        .filter(
            account =>
                account.name.toLowerCase() ===
                name.trim().toLowerCase() &&
                !account.archived
        )
        .first();

    if (existingAccount) {
        throw new Error("Account already exists");
    }
    await db.accounts.add(account);

    if (openingBalance !== 0) {
        await db.adjustments.add({
            id: crypto.randomUUID(),
            accountId: account.id,
            amount: openingBalance,
            reason: "Opening Balance",
            date: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        });
    }

    return account;
}

export async function getAccounts() {
    return db.accounts
        .filter(account => !account.archived)
        .toArray();
}