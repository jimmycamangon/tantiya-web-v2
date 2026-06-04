import { db } from "../../db/database";

export async function getRecentActivity() {

    const accounts =
        await db.accounts.toArray();

    const categories =
        await db.categories.toArray();

    const incomes =
        (await db.incomes.toArray())
            .filter(
                income =>
                    !income.isDeleted
            )
            .map(
                income => ({
                    type: "Income",

                    date:
                        income.date,

                    description:
                        income.notes ||
                        income.accountId,

                    amount:
                        income.amount
                })
            );

    const expenses =
        (await db.expenses.toArray())
            .filter(
                expense =>
                    !expense.isDeleted
            )
            .map(
                expense => ({

                    type:
                        "Expense",

                    date:
                        expense.date,

                    description:
                        categories.find(
                            category =>
                                category.id ===
                                expense.categoryId
                        )?.name ??
                        "Unknown",

                    amount:
                        expense.amount
                })
            );

    const transfers =
        (await db.transfers.toArray())
            .filter(
                transfer =>
                    !transfer.isDeleted
            )
            .map(
                transfer => ({

                    type:
                        "Transfer",

                    date:
                        transfer.date,

                    description:
                        `${accounts.find(
                            account =>
                                account.id ===
                                transfer.fromAccountId
                        )?.name ?? "Unknown"} → ${accounts.find(
                            account =>
                                account.id ===
                                transfer.toAccountId
                        )?.name ?? "Unknown"}`,

                    amount:
                        transfer.amount
                })
            );

    return [
        ...incomes,
        ...expenses,
        ...transfers
    ]
        .sort(
            (a, b) =>
                new Date(
                    b.date
                ).getTime() -
                new Date(
                    a.date
                ).getTime()
        )
        .slice(0, 5);
}