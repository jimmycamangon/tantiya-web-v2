import type { Account } from "../../types/account";
import type { Category } from "../../types/category";

export interface ResolvedExpense {
    amount: number;
    category: string;
    account: string;
    notes: string;
}


export function resolveQuickExpense(
    text: string,
    categories: Category[],
    accounts: Account[]
): ResolvedExpense {
    
    const parts = text
        .trim()
        .split(/\s+/);

    const amount =
        Number(parts[0]) || 0;

    let category = "Others";
    let account = "Cash";

    const notes: string[] = [];

    parts.slice(1).forEach(token => {
        const categoryMatch =
            categories.find(
                c =>
                    c.name.toLowerCase() ===
                    token.toLowerCase()
            );

        if (categoryMatch) {
            category =
                categoryMatch.name;
            return;
        }

        const accountMatch =
            accounts.find(
                a =>
                    a.name.toLowerCase() ===
                    token.toLowerCase()
            );

        if (accountMatch) {
            account =
                accountMatch.name;
            return;
        }

        notes.push(token);
    });

    return {
        amount,
        category,
        account,
        notes: notes.join(" "),
    };
}