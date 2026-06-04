import { db } from "../../db/database";

export async function getTopSpendingCategories() {

    const now =
        new Date();

    const currentMonth =
        now.getMonth();

    const currentYear =
        now.getFullYear();

    const expenses =
        await db.expenses
            .filter(
                expense => {

                    if (
                        expense.isDeleted
                    ) {
                        return false;
                    }

                    const date =
                        new Date(
                            expense.date
                        );

                    return (
                        date.getMonth() ===
                        currentMonth &&
                        date.getFullYear() ===
                        currentYear
                    );
                }
            )
            .toArray();

    const categories =
        await db.categories
            .toArray();

    const totals =
        new Map<
            string,
            number
        >();

    for (
        const expense
        of expenses
    ) {

        const current =
            totals.get(
                expense.categoryId
            ) ?? 0;

        totals.set(
            expense.categoryId,
            current +
            expense.amount
        );
    }

    return Array.from(
        totals.entries()
    )
        .map(
            (
                [
                    categoryId,
                    amount
                ]
            ) => {

                const category =
                    categories.find(
                        c =>
                            c.id ===
                            categoryId
                    );

                return {
                    categoryName:
                        category?.name ??
                        "Unknown",
                    amount
                };
            }
        )
        .sort(
            (a, b) =>
                b.amount -
                a.amount
        )
        .slice(0, 5);
}