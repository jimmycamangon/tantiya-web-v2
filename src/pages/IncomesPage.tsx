import AddIncomeForm
    from "../features/incomes/AddIncomeForm";

import IncomeList
    from "../features/incomes/IncomeList";

export default function IncomesPage() {

    return (
        <>
            <AddIncomeForm />

            <IncomeList />
        </>
    );
}