import QuickExpenseInput
    from "../features/expenses/QuickExpenseInput";

import AddExpenseForm
    from "../features/expenses/AddExpenseForm";

import ExpenseList
    from "../features/expenses/ExpenseList";

export default function ExpensesPage() {

    return (
        <>
            <QuickExpenseInput />

            <AddExpenseForm />

            <ExpenseList />
        </>
    );
}