import { useLiveQuery }
    from "dexie-react-hooks";

import {
    getMonthlyIncomeTotal,
    getMonthlyExpenseTotal
} from "./monthlySummary.service";

function formatCurrency(
    amount: number
) {
    return new Intl.NumberFormat(
        "en-PH",
        {
            style: "currency",
            currency: "PHP"
        }
    ).format(
        amount
    );
}

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

    const summary = [
        {
            label: "Income This Month",
            value: incomeTotal,
            tone: "text-emerald-700"
        },
        {
            label: "Expenses This Month",
            value: expenseTotal,
            tone: "text-red-700"
        },
        {
            label: "Net Savings",
            value: netSavings,
            tone: netSavings >= 0
                ? "text-stone-950"
                : "text-red-700"
        }
    ];

    return (
        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-base font-semibold text-stone-950">
                        Monthly Summary
                    </h2>
                    <p className="text-sm text-stone-500">
                        Current month cash movement
                    </p>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
                {summary.map(
                    item => (
                        <div
                            key={item.label}
                            className="rounded-md border border-stone-200 bg-stone-50 p-3"
                        >
                            <p className="text-xs font-medium text-stone-500">
                                {item.label}
                            </p>
                            <p className={`mt-2 text-lg font-semibold ${item.tone}`}>
                                {formatCurrency(item.value)}
                            </p>
                        </div>
                    )
                )}
            </div>
        </section>
    );
}
