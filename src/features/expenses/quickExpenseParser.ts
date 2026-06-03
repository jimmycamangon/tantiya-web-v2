export interface ParsedExpense {
    amount: number;
    tokens: string[];
}

export function parseQuickExpense(
    input: string
): ParsedExpense {

    const parts = input
        .trim()
        .split(/\s+/);

    if (parts.length < 4) {
        throw new Error(
            "Expected format: amount category account notes"
        );
    }

    const amount = Number(parts[0]);

    if (isNaN(amount) || amount <= 0) {
        throw new Error(
            "Invalid amount"
        );
    }

    return {
        amount,
        tokens: parts.slice(1),
    };
}