import { useMemo, useState }
    from "react";

import HistoryFilters
    from "../../components/HistoryFilters";

import {
    DEFAULT_HISTORY_FILTERS,
    HISTORY_PAGE_SIZE,
    matchesPeriod,
    matchesSearch,
    sortNewestFirst,
} from "../../utils/historyFilter";

import type { HistoryFilterState }
    from "../../utils/historyFilter";

import {
    Check,
    Pencil,
    Trash2,
    X
} from "lucide-react";

import {
    useConfirmDialog,
    useToast
} from "../../components/AppFeedback";

import { useLiveQuery }
    from "dexie-react-hooks";

import { db }
    from "../../db/database";

import {
    getTransfers,
    updateTransfer,
    softDeleteTransfer
} from "./transfer.service";

import type { Transfer }
    from "../../types/transfer";

import {
    toDateKey,
    toEntryDate,
    todayKey
} from "../../utils/entryDate";


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

export default function TransferList() {

    const transfers =
        useLiveQuery(
            () => getTransfers(),
            []
        );

    const accounts =
        useLiveQuery(
            () => db.accounts.toArray(),
            []
        );

    const [
        editingTransferId,
        setEditingTransferId
    ] = useState("");

    const [
        editAmount,
        setEditAmount
    ] = useState("");

    const [
        editNotes,
        setEditNotes
    ] = useState("");

    const [
        editDate,
        setEditDate
    ] = useState("");

    const [filters, setFilters] =
        useState<HistoryFilterState>(DEFAULT_HISTORY_FILTERS);

    const [visibleCount, setVisibleCount] =
        useState(HISTORY_PAGE_SIZE);

    // Reset paging whenever a filter changes.
    function updateFilters(next: HistoryFilterState) {
        setFilters(next);
        setVisibleCount(HISTORY_PAGE_SIZE);
    }

    const filteredTransfers = useMemo(() => {

        const nameOf = (accountId: string) =>
            accounts?.find(a => a.id === accountId)?.name;

        return sortNewestFirst(
            (transfers ?? []).filter(transfer =>
                matchesSearch(
                    filters.search,
                    transfer.notes,
                    nameOf(transfer.fromAccountId),
                    nameOf(transfer.toAccountId)
                ) &&
                matchesPeriod(transfer.date, filters.period) &&
                (filters.option === "all" ||
                    transfer.fromAccountId === filters.option ||
                    transfer.toAccountId === filters.option)
            )
        );
    }, [transfers, accounts, filters]);

    const confirm =
        useConfirmDialog();

    const toast =
        useToast();

    function getAccountName(
        accountId: string
    ) {
        return (
            accounts?.find(
                account =>
                    account.id ===
                    accountId
            )?.name ??
            "Unknown"
        );
    }

    if (
        !transfers ||
        transfers.length === 0
    ) {
        return (
            <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">

                <div className="mb-4">
                    <h2 className="text-base font-semibold text-stone-950">
                        Transfer History
                    </h2>

                    <p className="text-sm text-stone-500">
                        Money moved between accounts.
                    </p>
                </div>

                <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                    No transfers recorded yet.
                </div>

            </section>
        );
    }
    return (
        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">

            <div className="mb-4">
                <h2 className="text-base font-semibold text-stone-950">
                    Transfer History
                </h2>

                <p className="text-sm text-stone-500">
                    Money moved between accounts.
                </p>
            </div>

            <HistoryFilters
                filters={filters}
                onChange={updateFilters}
                searchPlaceholder="Search transfers..."
                options={(accounts ?? []).map(account => ({
                    value: account.id,
                    label: account.name,
                }))}
                allOptionLabel="All Accounts"
                shownCount={Math.min(visibleCount, filteredTransfers.length)}
                totalCount={filteredTransfers.length}
                itemLabel={["transfer", "transfers"]}
            />

            {filteredTransfers.length === 0 && (
                <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                    No transfers match your filters.
                </div>
            )}

            <div className="divide-y divide-stone-100 overflow-hidden rounded-md border border-stone-200 empty:hidden">

                {filteredTransfers.slice(0, visibleCount).map(
                    transfer => (

                        <div
                            key={transfer.id}
                            className="px-4 py-3"
                        >

                            {
                                editingTransferId === transfer.id
                                    ? (
                                        <div className="grid gap-3 lg:grid-cols-[140px_1fr_120px_1fr_auto] lg:items-center">

                                            <input
                                                type="date"
                                                value={editDate}
                                                max={todayKey()}
                                                onChange={(e) =>
                                                    setEditDate(
                                                        e.target.value
                                                    )
                                                }
                                                className="h-10 rounded-md border border-stone-300 bg-white px-2 text-sm text-stone-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                            />

                                            <p className="font-medium text-stone-950">
                                                {
                                                    getAccountName(
                                                        transfer.fromAccountId
                                                    )
                                                }
                                                {" → "}
                                                {
                                                    getAccountName(
                                                        transfer.toAccountId
                                                    )
                                                }
                                            </p>

                                            <input
                                                type="number"
                                                value={editAmount}
                                                onChange={(e) =>
                                                    setEditAmount(
                                                        e.target.value
                                                    )
                                                }
                                                className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                            />

                                            <input
                                                value={editNotes}
                                                onChange={(e) =>
                                                    setEditNotes(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Note"
                                                className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                            />

                                            <div className="flex gap-2">

                                                <button
                                                    type="button"
                                                    title="Save transfer"
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-emerald-600 text-white transition hover:bg-emerald-700"
                                                    onClick={async () => {

                                                        try {

                                                            const updates: Partial<Transfer> = {
                                                                amount:
                                                                    Number(
                                                                        editAmount
                                                                    ),
                                                                notes:
                                                                    editNotes
                                                            };

                                                            // Only change the date when it was edited,
                                                            // so the original time of day is kept.
                                                            if (
                                                                editDate &&
                                                                editDate !== toDateKey(transfer.date)
                                                            ) {
                                                                updates.date =
                                                                    toEntryDate(editDate).toISOString();
                                                            }

                                                            await updateTransfer(
                                                                transfer.id,
                                                                updates
                                                            );

                                                            toast({
                                                                type: "success",
                                                                message:
                                                                    "Transfer updated."
                                                            });

                                                            setEditingTransferId(
                                                                ""
                                                            );

                                                        } catch (error) {

                                                            toast({
                                                                type: "error",
                                                                message:
                                                                    error instanceof Error
                                                                        ? error.message
                                                                        : "Unable to update transfer."
                                                            });
                                                        }
                                                    }}
                                                >
                                                    <Check
                                                        className="h-4 w-4"
                                                    />
                                                </button>

                                                <button
                                                    type="button"
                                                    title="Cancel editing"
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-600 transition hover:bg-stone-50 hover:text-stone-950"
                                                    onClick={() =>
                                                        setEditingTransferId(
                                                            ""
                                                        )
                                                    }

                                                >
                                                    <X
                                                        className="h-4 w-4"
                                                    />
                                                </button>

                                            </div>

                                        </div>
                                    )
                                    : (
                                        <>
                                            <div className="grid gap-3 lg:grid-cols-[140px_1fr_140px_auto] lg:items-center">

                                                <p className="text-stone-500">
                                                    {formatDate(
                                                        transfer.date
                                                    )}
                                                </p>

                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-stone-950">
                                                        {
                                                            getAccountName(
                                                                transfer.fromAccountId
                                                            )
                                                        }
                                                        {" → "}
                                                        {
                                                            getAccountName(
                                                                transfer.toAccountId
                                                            )
                                                        }
                                                    </p>

                                                    <p className="text-xs text-stone-500">
                                                        {
                                                            transfer.notes ||
                                                            "Transfer"
                                                        }
                                                    </p>
                                                </div>

                                                <p className="font-semibold text-emerald-700 lg:text-right">
                                                    {formatCurrency(
                                                        transfer.amount
                                                    )}
                                                </p>

                                                <div className="flex gap-2 lg:justify-end">
                                                    <button
                                                        type="button"
                                                        title="Edit transfer"
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-600 transition hover:bg-stone-50 hover:text-stone-950"
                                                        onClick={() => {

                                                            setEditingTransferId(
                                                                transfer.id
                                                            );

                                                            setEditAmount(
                                                                transfer.amount.toString()
                                                            );

                                                            setEditNotes(
                                                                transfer.notes ??
                                                                ""
                                                            );

                                                            setEditDate(
                                                                toDateKey(transfer.date)
                                                            );
                                                        }}
                                                    >
                                                        <Pencil
                                                            className="h-4 w-4"
                                                        />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        title="Delete transfer"
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                                                        onClick={async () => {

                                                            const confirmed =
                                                                await confirm({
                                                                    title:
                                                                        "Delete transfer?",
                                                                    message:
                                                                        "This will remove the transfer from your active history.",
                                                                    confirmLabel:
                                                                        "Delete",
                                                                    tone:
                                                                        "danger"
                                                                });

                                                            if (
                                                                !confirmed
                                                            ) {
                                                                return;
                                                            }

                                                            await softDeleteTransfer(
                                                                transfer.id
                                                            );

                                                            toast({
                                                                type: "success",
                                                                message:
                                                                    "Transfer deleted."
                                                            });
                                                        }}
                                                    >
                                                        <Trash2
                                                            className="h-4 w-4"
                                                        />
                                                    </button>

                                                </div>

                                            </div>
                                        </>
                                    )
                            }

                        </div>
                    )
                )}

            </div>

            {filteredTransfers.length > visibleCount && (
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

        </section>
    );
}