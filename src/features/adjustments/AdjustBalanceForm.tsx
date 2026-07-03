import { useState } from "react";

import { useToast } from "../../components/AppFeedback";

import { adjustAccountToBalance } from "./adjustment.service";

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
    }).format(amount);
}

interface AdjustBalanceFormProps {
    accountId: string;
    accountName: string;
    currentBalance: number;
    onClose: () => void;
}

export default function AdjustBalanceForm({
    accountId,
    accountName,
    currentBalance,
    onClose,
}: AdjustBalanceFormProps) {

    const [targetBalance, setTargetBalance] = useState("");

    const [reason, setReason] = useState("");

    const [isSaving, setIsSaving] = useState(false);

    const toast = useToast();

    const parsedTarget = Number(targetBalance);

    const hasValidTarget =
        targetBalance.trim() !== "" &&
        Number.isFinite(parsedTarget);

    const delta = hasValidTarget
        ? parsedTarget - currentBalance
        : 0;

    async function handleSubmit() {

        if (!hasValidTarget) {
            toast({
                type: "error",
                message: "Enter a valid balance amount.",
            });
            return;
        }

        setIsSaving(true);

        try {
            await adjustAccountToBalance(
                accountId,
                parsedTarget,
                reason
            );

            toast({
                type: "success",
                message: `${accountName} balance adjusted.`,
            });

            onClose();
        } catch (error) {
            toast({
                type: "error",
                message:
                    error instanceof Error
                        ? error.message
                        : "Unable to adjust balance.",
            });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="space-y-3 rounded-md border border-emerald-200 bg-emerald-50/50 p-3">
            <div>
                <p className="text-sm font-semibold text-stone-950">
                    Adjust balance
                </p>
                <p className="text-xs text-stone-500">
                    Current balance: {formatCurrency(currentBalance)}. Enter
                    the actual balance and the difference is recorded as an
                    adjustment.
                </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-stone-700">
                        Actual balance
                    </span>
                    <input
                        type="number"
                        step="0.01"
                        value={targetBalance}
                        onChange={e =>
                            setTargetBalance(e.target.value)
                        }
                        placeholder="0.00"
                        className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-stone-700">
                        Reason (optional)
                    </span>
                    <input
                        type="text"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="e.g. Bank fee, cash count"
                        className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                </label>
            </div>

            {hasValidTarget && delta !== 0 && (
                <p className="text-sm">
                    <span className="text-stone-500">
                        Adjustment to record:{" "}
                    </span>
                    <span
                        className={
                            "font-semibold " +
                            (delta > 0
                                ? "text-emerald-700"
                                : "text-red-600")
                        }
                    >
                        {delta > 0 ? "+" : ""}
                        {formatCurrency(delta)}
                    </span>
                </p>
            )}

            <div className="flex gap-2">
                <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSubmit}
                    className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
                >
                    Save adjustment
                </button>

                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
