import { useMemo, useState } from "react";

import { useLiveQuery } from "dexie-react-hooks";

import { Trash2 } from "lucide-react";

import { format } from "date-fns";

import {
    useConfirmDialog,
    useToast,
} from "../../components/AppFeedback";

import HistoryFilters from "../../components/HistoryFilters";

import { db } from "../../db/database";

import {
    DEFAULT_HISTORY_FILTERS,
    HISTORY_PAGE_SIZE,
    matchesPeriod,
    matchesSearch,
} from "../../utils/historyFilter";

import type { HistoryFilterState } from "../../utils/historyFilter";

import {
    getAdjustments,
    deleteAdjustment,
} from "./adjustment.service";

// Opening balances are usually old, so start with everything visible.
const ADJUSTMENT_DEFAULT_FILTERS: HistoryFilterState = {
    ...DEFAULT_HISTORY_FILTERS,
    period: "allTime",
};

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
    }).format(amount);
}

export default function AdjustmentHistory() {

    const adjustments =
        useLiveQuery(() => getAdjustments(), []);

    const accounts =
        useLiveQuery(() => db.accounts.toArray(), []) ?? [];

    const confirm = useConfirmDialog();

    const toast = useToast();

    const [filters, setFilters] =
        useState<HistoryFilterState>(ADJUSTMENT_DEFAULT_FILTERS);

    const [visibleCount, setVisibleCount] =
        useState(HISTORY_PAGE_SIZE);

    // Reset paging whenever a filter changes.
    function updateFilters(next: HistoryFilterState) {
        setFilters(next);
        setVisibleCount(HISTORY_PAGE_SIZE);
    }

    // getAdjustments() already returns newest first.
    const filteredAdjustments = useMemo(
        () =>
            (adjustments ?? []).filter(adjustment =>
                matchesSearch(
                    filters.search,
                    adjustment.reason,
                    adjustment.accountName
                ) &&
                matchesPeriod(adjustment.date, filters.period) &&
                (filters.option === "all" ||
                    adjustment.accountId === filters.option)
            ),
        [adjustments, filters]
    );

    if (!adjustments || adjustments.length === 0) {
        return (
            <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                No adjustments recorded yet.
            </div>
        );
    }

    return (
        <>
            <HistoryFilters
                filters={filters}
                onChange={updateFilters}
                searchPlaceholder="Search adjustments..."
                options={accounts.map(account => ({
                    value: account.id,
                    label: account.name,
                }))}
                allOptionLabel="All Accounts"
                shownCount={Math.min(visibleCount, filteredAdjustments.length)}
                totalCount={filteredAdjustments.length}
                itemLabel={["adjustment", "adjustments"]}
            />

            {filteredAdjustments.length === 0 && (
                <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                    No adjustments match your filters.
                </div>
            )}

            <div className="divide-y divide-stone-100 overflow-hidden rounded-md border border-stone-200 empty:hidden">
                {filteredAdjustments.slice(0, visibleCount).map(adjustment => (
                <div
                    key={adjustment.id}
                    className="grid gap-3 px-3 py-3 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                >
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-stone-950">
                            {adjustment.reason ?? "Adjustment"}
                        </p>
                        <p className="text-xs text-stone-500">
                            {adjustment.accountName} ·{" "}
                            {format(
                                new Date(adjustment.date),
                                "MMM d, yyyy"
                            )}
                        </p>
                    </div>

                    <div
                        className={
                            "text-sm font-semibold sm:text-right " +
                            (adjustment.amount >= 0
                                ? "text-emerald-700"
                                : "text-red-600")
                        }
                    >
                        {adjustment.amount >= 0 ? "+" : ""}
                        {formatCurrency(adjustment.amount)}
                    </div>

                    <div className="flex sm:justify-end">
                        <button
                            type="button"
                            title="Delete adjustment"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                            onClick={async () => {

                                const confirmed = await confirm({
                                    title: "Delete adjustment?",
                                    message: `This will change the balance of ${adjustment.accountName} by ${formatCurrency(-adjustment.amount)}.`,
                                    confirmLabel: "Delete",
                                    tone: "warning",
                                });

                                if (!confirmed) {
                                    return;
                                }

                                await deleteAdjustment(
                                    adjustment.id
                                );

                                toast({
                                    type: "success",
                                    message: "Adjustment deleted.",
                                });
                            }}
                        >
                            <Trash2
                                aria-hidden="true"
                                className="h-4 w-4"
                            />
                        </button>
                    </div>
                </div>
                ))}
            </div>

            {filteredAdjustments.length > visibleCount && (
                <div className="mt-4 flex justify-center">
                    <button
                        type="button"
                        onClick={() =>
                            setVisibleCount(prev => prev + 50)
                        }
                        className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium"
                    >
                        Load More
                    </button>
                </div>
            )}
        </>
    );
}