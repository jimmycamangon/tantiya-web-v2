import { useEffect, useState }
    from "react";
import { useLiveQuery }
    from "dexie-react-hooks";
import { Check, Pencil, Trash2, X }
    from "lucide-react";

import {
    useConfirmDialog,
    useToast
} from "../../components/AppFeedback";
import { db }
    from "../../db/database";
import { softDeleteExpense, updateExpense }
    from "./expense.service";

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

function formatDate(
    date: string
) {
    return new Intl.DateTimeFormat(
        "en-PH",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    ).format(
        new Date(date)
    );
}

export default function ExpenseList() {

    const [visibleCount,
        setVisibleCount] =
        useState(10);

    const [categoryFilter,
        setCategoryFilter] =
        useState("all");

    const [searchTerm,
        setSearchTerm] =
        useState("");

    const [period,
        setPeriod] =
        useState<
            "thisMonth" |
            "lastMonth" |
            "allTime"
        >("thisMonth");


    const [editingExpenseId, setEditingExpenseId] =
        useState<string | null>(null);

    const [editAmount, setEditAmount] =
        useState("");

    const [editNotes, setEditNotes] =
        useState("");

    const confirm =
        useConfirmDialog();

    const toast =
        useToast();

    const categories =
        useLiveQuery(
            () =>
                db.categories
                    .filter(
                        category =>
                            !category.archived
                    )
                    .toArray(),
            []
        ) ?? [];


    const expensesWithDetails = useLiveQuery(async () => {

        const expenses = (
            await db.expenses.toArray()
        ).filter(expense => !expense.isDeleted);

        const categories = await db.categories.toArray();
        const accounts = await db.accounts.toArray();

        return expenses
            .map((expense) => ({
                ...expense,
                categoryName:
                    categories.find(
                        (c) => c.id === expense.categoryId
                    )?.name ?? "Unknown",

                accountName:
                    accounts.find(
                        (a) => a.id === expense.accountId
                    )?.name ?? "Unknown",
            }))
            .filter(expense => {

                const matchesSearch =

                    searchTerm === "" ||

                    expense.notes
                        ?.toLowerCase()
                        .includes(
                            searchTerm
                                .toLowerCase()
                        ) ||

                    expense.categoryName
                        .toLowerCase()
                        .includes(
                            searchTerm
                                .toLowerCase()
                        ) ||

                    expense.accountName
                        .toLowerCase()
                        .includes(
                            searchTerm
                                .toLowerCase()
                        );

                const expenseDate =
                    new Date(
                        expense.date
                    );

                const now =
                    new Date();

                let matchesPeriod =
                    true;

                if (
                    period ===
                    "thisMonth"
                ) {

                    matchesPeriod =
                        expenseDate.getMonth() ===
                        now.getMonth() &&

                        expenseDate.getFullYear() ===
                        now.getFullYear();
                }

                if (
                    period ===
                    "lastMonth"
                ) {

                    const lastMonth =
                        new Date(
                            now.getFullYear(),
                            now.getMonth() - 1,
                            1
                        );

                    matchesPeriod =
                        expenseDate.getMonth() ===
                        lastMonth.getMonth() &&

                        expenseDate.getFullYear() ===
                        lastMonth.getFullYear();
                }

                const matchesCategory =

                    categoryFilter ===
                    "all" ||

                    expense.categoryId ===
                    categoryFilter;

                return (
                    matchesSearch &&
                    matchesPeriod &&
                    matchesCategory
                );
            })
            .sort(
                (a, b) =>
                    new Date(
                        b.date
                    ).getTime() -
                    new Date(
                        a.date
                    ).getTime()
            );

    }, [
        searchTerm,
        period,
        categoryFilter
    ]);

    useEffect(() => {

        setVisibleCount(
            10
        );

    }, [
        searchTerm,
        period,
        categoryFilter
    ]);

    return (
        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4">
                <h2 className="text-base font-semibold text-stone-950">
                    Expense History
                </h2>
                <p className="text-sm text-stone-500">
                    Recent expenses arranged from newest to oldest.
                </p>

                <div className="mb-4 mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <input
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(
                                e.target.value
                            )
                        }
                        placeholder="Search expenses..."
                        className="h-10 w-full max-w-sm rounded-md border border-stone-300 px-3 text-sm"
                    />



                </div>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="inline-flex rounded-lg border border-stone-200 bg-stone-100 p-1">

                        <button
                            type="button"
                            onClick={() =>
                                setPeriod(
                                    "thisMonth"
                                )
                            }
                            className={
                                period ===
                                    "thisMonth"
                                    ? "rounded-md bg-white px-3 py-2 text-sm font-medium text-stone-950 shadow-sm"
                                    : "rounded-md px-3 py-2 text-sm text-stone-600 transition hover:text-stone-950"
                            }
                        >
                            This Month
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setPeriod(
                                    "lastMonth"
                                )
                            }
                            className={
                                period ===
                                    "lastMonth"
                                    ? "rounded-md bg-white px-3 py-2 text-sm font-medium text-stone-950 shadow-sm"
                                    : "rounded-md px-3 py-2 text-sm text-stone-600 transition hover:text-stone-950"
                            }
                        >
                            Last Month
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setPeriod(
                                    "allTime"
                                )
                            }
                            className={
                                period ===
                                    "allTime"
                                    ? "rounded-md bg-white px-3 py-2 text-sm font-medium text-stone-950 shadow-sm"
                                    : "rounded-md px-3 py-2 text-sm text-stone-600 transition hover:text-stone-950"
                            }
                        >
                            All Time
                        </button>
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={(e) =>
                            setCategoryFilter(
                                e.target.value
                            )
                        }
                        className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm"
                    >
                        <option value="all">
                            All Categories
                        </option>

                        {categories.map(
                            category => (
                                <option
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.name}
                                </option>
                            )
                        )}
                    </select>
                </div>
                <p className="text-sm text-stone-500">
                    Showing {
                        Math.min(
                            visibleCount,
                            expensesWithDetails?.length ?? 0
                        )
                    }

                    {" of "}

                    {
                        expensesWithDetails?.length ?? 0
                    }

                    {
                        (expensesWithDetails?.length ?? 0) === 1
                            ? " expense"
                            : " expenses"
                    }
                </p>
            </div>

            {!expensesWithDetails ||
                expensesWithDetails.length === 0
                ? (
                    <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                        No expenses recorded yet.
                    </div>
                )
                : (
                    <>
                        <div className="divide-y divide-stone-100 overflow-hidden rounded-md border border-stone-200">
                            {expensesWithDetails
                                ?.slice(
                                    0,
                                    visibleCount
                                )
                                .map((expense) => (
                                    <div
                                        key={expense.id}
                                        className="grid gap-3 px-3 py-3 text-sm lg:grid-cols-[120px_1fr_140px_130px_auto] lg:items-center"
                                    >
                                        {editingExpenseId === expense.id ? (
                                            <>
                                                <p className="text-stone-500">
                                                    {formatDate(expense.date)}
                                                </p>

                                                <input
                                                    value={editNotes}
                                                    onChange={(e) =>
                                                        setEditNotes(e.target.value)
                                                    }
                                                    placeholder="Notes"
                                                    className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                                />

                                                <p className="w-fit rounded-full bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700">
                                                    {expense.categoryName}
                                                </p>

                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={editAmount}
                                                    onChange={(e) =>
                                                        setEditAmount(e.target.value)
                                                    }
                                                    className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                                />

                                                <div className="flex gap-2 lg:justify-end">
                                                    <button
                                                        type="button"
                                                        title="Save expense"
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-emerald-600 text-white transition hover:bg-emerald-700"
                                                        onClick={async () => {
                                                            try {
                                                                await updateExpense(
                                                                    expense.id,
                                                                    Number(editAmount),
                                                                    editNotes
                                                                );

                                                                toast({
                                                                    type: "success",
                                                                    message: "Expense updated."
                                                                });

                                                                setEditingExpenseId(null);
                                                            } catch (error) {
                                                                toast({
                                                                    type: "error",
                                                                    message: error instanceof Error
                                                                        ? error.message
                                                                        : "Unable to update expense."
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        <Check
                                                            aria-hidden="true"
                                                            className="h-4 w-4"
                                                        />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        title="Cancel editing"
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-600 transition hover:bg-stone-50 hover:text-stone-950"
                                                        onClick={() =>
                                                            setEditingExpenseId(null)
                                                        }
                                                    >
                                                        <X
                                                            aria-hidden="true"
                                                            className="h-4 w-4"
                                                        />
                                                    </button>
                                                </div>
                                            </>


                                        ) : (
                                            <>
                                                <p className="text-stone-500">
                                                    {formatDate(expense.date)}
                                                </p>

                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-stone-950">
                                                        {expense.notes || "Expense"}
                                                    </p>
                                                    <p className="text-xs text-stone-500">
                                                        {expense.accountName}
                                                    </p>
                                                </div>

                                                <p className="w-fit rounded-full bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700">
                                                    {expense.categoryName}
                                                </p>

                                                <p className="font-semibold text-red-700 lg:text-right">
                                                    {formatCurrency(expense.amount)}
                                                </p>

                                                <div className="flex gap-2 lg:justify-end">
                                                    <button
                                                        type="button"
                                                        title="Edit expense"
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-600 transition hover:bg-stone-50 hover:text-stone-950"
                                                        onClick={() => {
                                                            setEditingExpenseId(
                                                                expense.id
                                                            );
                                                            setEditAmount(
                                                                expense.amount.toString()
                                                            );
                                                            setEditNotes(
                                                                expense.notes ?? ""
                                                            );
                                                        }}
                                                    >
                                                        <Pencil
                                                            aria-hidden="true"
                                                            className="h-4 w-4"
                                                        />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        title="Delete expense"
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                                                        onClick={async () => {
                                                            const confirmed =
                                                                await confirm({
                                                                    title: "Delete expense?",
                                                                    message: "This will remove the expense from your active history.",
                                                                    confirmLabel: "Delete",
                                                                    tone: "danger"
                                                                });

                                                            if (!confirmed) {
                                                                return;
                                                            }

                                                            await softDeleteExpense(
                                                                expense.id
                                                            );

                                                            toast({
                                                                type: "success",
                                                                message: "Expense deleted."
                                                            });
                                                        }}
                                                    >
                                                        <Trash2
                                                            aria-hidden="true"
                                                            className="h-4 w-4"
                                                        />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                ))}
                        </div>


                        {
                            expensesWithDetails &&
                            expensesWithDetails.length >
                            visibleCount && (

                                <div className="mt-4 flex justify-center">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setVisibleCount(
                                                prev =>
                                                    prev + 50
                                            )
                                        }
                                        className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium"
                                    >
                                        Load More
                                    </button>

                                </div>
                            )
                        }
                    </>
                )}
        </section>

    );
}
