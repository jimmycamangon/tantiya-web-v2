import { useLiveQuery } from "dexie-react-hooks";

import { Trash2 } from "lucide-react";

import { format } from "date-fns";

import {
    useConfirmDialog,
    useToast,
} from "../../components/AppFeedback";

import {
    getAdjustments,
    deleteAdjustment,
} from "./adjustment.service";

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
    }).format(amount);
}

export default function AdjustmentHistory() {

    const adjustments =
        useLiveQuery(() => getAdjustments(), []) ?? [];

    const confirm = useConfirmDialog();

    const toast = useToast();

    if (adjustments.length === 0) {
        return (
            <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                No adjustments recorded yet.
            </div>
        );
    }

    return (
        <div className="divide-y divide-stone-100 overflow-hidden rounded-md border border-stone-200">
            {adjustments.map(adjustment => (
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
    );
}
