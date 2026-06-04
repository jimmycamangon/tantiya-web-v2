import { db } from "../../db/database";

export async function getMonthlyIncomeTotal() {

    const now =
        new Date();

    const currentMonth =
        now.getMonth();

    const currentYear =
        now.getFullYear();

    const incomes =
        await db.incomes
            .filter(
                income => {

                    if (
                        income.isDeleted
                    ) {
                        return false;
                    }

                    const date =
                        new Date(
                            income.date
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

    return incomes.reduce(
        (
            total,
            income
        ) =>
            total +
            income.amount,
        0
    );
}

export async function getMonthlyExpenseTotal() {

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

    return expenses.reduce(
        (
            total,
            expense
        ) =>
            total +
            expense.amount,
        0
    );
}