import AddIncomeForm
    from "../features/incomes/AddIncomeForm";

import IncomeList
    from "../features/incomes/IncomeList";

export default function IncomesPage() {

    return (
        <div className="space-y-6">

            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-emerald-700">
                    Income
                </p>

                <h1 className="text-2xl font-semibold text-stone-950 sm:text-3xl">
                    Incomes
                </h1>

                <p className="max-w-2xl text-sm text-stone-500">
                    Track salary, allowances, and other money coming in.
                </p>
            </div>

            <AddIncomeForm />

            <IncomeList />

        </div>
    );
}