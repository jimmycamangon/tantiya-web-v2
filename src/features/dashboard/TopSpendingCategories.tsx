import { useLiveQuery }
    from "dexie-react-hooks";

import {
    getTopSpendingCategories
} from "./topSpending.service";

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

export default function TopSpendingCategories() {

    const categories =
        useLiveQuery(
            () =>
                getTopSpendingCategories(),
            []
        ) ?? [];

    const maxAmount =
        Math.max(
            ...categories.map(
                category =>
                    category.amount
            ),
            0
        );

    return (
        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <div className="mb-4">
                <h2 className="text-base font-semibold text-stone-950">
                    Top Spending Categories
                </h2>
                <p className="text-sm text-stone-500">
                    Highest expense groups this month
                </p>
            </div>

            {categories.length === 0
                ? (
                    <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                        No expenses this month.
                    </div>
                )
                : (
                    <div className="space-y-3">
                        {categories.map(
                            category => {
                                const width =
                                    maxAmount > 0
                                        ? `${Math.max((category.amount / maxAmount) * 100, 8)}%`
                                        : "0%";

                                return (
                                    <div
                                        key={category.categoryName}
                                        className="space-y-1"
                                    >
                                        <div className="flex items-center justify-between gap-3 text-sm">
                                            <p className="truncate font-medium text-stone-950">
                                                {category.categoryName}
                                            </p>
                                            <p className="shrink-0 font-semibold text-stone-700">
                                                {formatCurrency(category.amount)}
                                            </p>
                                        </div>

                                        <div className="h-2 rounded-full bg-stone-100">
                                            <div
                                                className="h-full rounded-full bg-emerald-600"
                                                style={{
                                                    width
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            }
                        )}
                    </div>
                )}
        </section>
    );
}
