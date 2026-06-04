import { useLiveQuery }
    from "dexie-react-hooks";

import {
    getMonthlyIncomeTotal,
    getMonthlyExpenseTotal
} from "./monthlySummary.service";

export default function MonthlySummary() {

    const incomeTotal =
        useLiveQuery(
            () =>
                getMonthlyIncomeTotal(),
            []
        ) ?? 0;

    const expenseTotal =
        useLiveQuery(
            () =>
                getMonthlyExpenseTotal(),
            []
        ) ?? 0;

    const netSavings =
        incomeTotal -
        expenseTotal;

    return (
        <div>

            <h2>
                Monthly Summary
            </h2>

            <div>
                Income This Month:
                ₱{incomeTotal.toLocaleString()}
            </div>

            <div>
                Expenses This Month:
                ₱{expenseTotal.toLocaleString()}
            </div>

            <div>
                Net Savings:
                ₱{netSavings.toLocaleString()}
            </div>

        </div>
    );
}