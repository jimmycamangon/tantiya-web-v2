import QuickExpenseInput
    from "../features/expenses/QuickExpenseInput";

import AddExpenseForm
    from "../features/expenses/AddExpenseForm";

import ExpenseList
    from "../features/expenses/ExpenseList";

export default function ExpensesPage() {

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-emerald-700">
                    Spending
                </p>
                <h1 className="text-2xl font-semibold text-stone-950 sm:text-3xl">
                    Expenses
                </h1>
                <p className="max-w-2xl text-sm text-stone-500">
                    Record daily spending quickly, or use the manual form when you need more control.
                </p>
            </div>

            <QuickExpenseInput />

            <AddExpenseForm />

            <ExpenseList />
        </div>
    );
}
