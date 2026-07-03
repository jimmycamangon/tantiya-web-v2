import { useState } from "react";

import {
    Check,
    HandCoins,
    Pencil,
    Trash2,
    Undo2,
    X
} from "lucide-react";

import {
    useConfirmDialog,
    useToast
} from "../../components/AppFeedback";

import { useLiveQuery }
    from "dexie-react-hooks";

import {
    getObligations,
    deactivateObligation,
    updateObligation
} from "./obligation.service";

import {
    getObligationDueInfo
} from "./obligationSchedule";

import {
    getObligationStatus
} from "./getObligationStatus";

import {
    getPaidPeriodKeys,
    unmarkObligationPaid
} from "./obligationPayment.service";

import MarkPaidForm from "./MarkPaidForm";

function formatCurrency(
    amount: number
) {
    return new Intl.NumberFormat(
        "en-PH",
        {
            style: "currency",
            currency: "PHP"
        }
    ).format(amount);
}

function formatRecurrence(
    value: string
) {
    switch (value) {

        case "monthly":
            return "Monthly";

        case "weekly":
            return "Weekly";

        case "yearly":
            return "Yearly";

        case "one_time":
            return "One Time";

        default:
            return value;
    }
}

function formatFundingRule(
    value: string
) {
    switch (value) {

        case "current_cutoff":
            return "Current Cutoff";

        case "previous_cutoff":
            return "Previous Cutoff";

        case "split_cutoffs":
            return "Split Cutoffs";

        default:
            return value;
    }
}

function getStatusClasses(
    status: string
) {

    switch (status) {

        case "Paid":
            return "bg-emerald-600 text-white";

        case "Overdue":
            return "bg-red-100 text-red-700";

        case "Due Soon":
            return "bg-red-100 text-red-700";

        case "Prepare Funds":
            return "bg-amber-100 text-amber-700";

        default:
            return "bg-emerald-100 text-emerald-700";
    }
}


export default function ObligationList() {

    const obligations =
        useLiveQuery(
            () => getObligations(),
            []
        );

    const paidPeriodKeys =
        useLiveQuery(
            () => getPaidPeriodKeys(),
            []
        );

    const [
        markingPaidId,
        setMarkingPaidId
    ] = useState("");

    const [
        editingObligationId,
        setEditingObligationId
    ] = useState("");

    const [editName,
        setEditName] =
        useState("");

    const [editAmount,
        setEditAmount] =
        useState("");

    const [editDueDay,
        setEditDueDay] =
        useState("");

    const confirm =
        useConfirmDialog();

    const toast =
        useToast();

    if (
        !obligations ||
        obligations.length === 0
    ) {
        return (
            <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">

                <div className="mb-4">
                    <h2 className="text-base font-semibold text-stone-950">
                        Active Obligations
                    </h2>

                    <p className="text-sm text-stone-500">
                        Recurring bills and planned commitments.
                    </p>
                </div>

                <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                    No obligations added yet.
                </div>

            </section>
        );
    }
    return (
        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">

            <div className="mb-4">
                <h2 className="text-base font-semibold text-stone-950">
                    Active Obligations
                </h2>

                <p className="text-sm text-stone-500">
                    Recurring bills and planned commitments.
                </p>
            </div>

            <div className="grid gap-4">

                {obligations.map(
                    obligation => {

                        const dueInfo =
                            getObligationDueInfo(
                                obligation,
                                paidPeriodKeys?.get(
                                    obligation.id
                                ) ?? new Set()
                            );

                        const daysUntilDue =
                            dueInfo.daysUntilDue;

                        const status =
                            dueInfo.paidForCurrentPeriod
                                ? "Paid"
                                : getObligationStatus(
                                    daysUntilDue
                                );

                        return (
                            <div
                                key={
                                    obligation.id
                                }
                                className="rounded-lg border border-stone-200 bg-stone-50 p-4"
                            >

                                {
                                    editingObligationId ===
                                        obligation.id
                                        ? (
                                            <>
                                                <div className="grid gap-3 lg:grid-cols-[1fr_140px_100px_auto_auto] lg:items-center">
                                                    <input
                                                        className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                                        value={
                                                            editName
                                                        }
                                                        onChange={(e) =>
                                                            setEditName(
                                                                e.target.value
                                                            )
                                                        }
                                                    />

                                                    <input
                                                        type="number"
                                                        className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                                        value={
                                                            editAmount
                                                        }
                                                        onChange={(e) =>
                                                            setEditAmount(
                                                                e.target.value
                                                            )
                                                        }
                                                    />

                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="31"
                                                        className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                                        value={
                                                            editDueDay
                                                        }
                                                        onChange={(e) =>
                                                            setEditDueDay(
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                    <button
                                                        type="button"
                                                        title="Save obligation"
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-emerald-600 text-white transition hover:bg-emerald-700"
                                                        onClick={async () => {

                                                            try {

                                                                await updateObligation(
                                                                    obligation.id,
                                                                    {
                                                                        name:
                                                                            editName,

                                                                        amount:
                                                                            Number(
                                                                                editAmount
                                                                            ),

                                                                        dueDay:
                                                                            Number(
                                                                                editDueDay
                                                                            )
                                                                    }
                                                                );

                                                                toast({
                                                                    type: "success",
                                                                    message:
                                                                        "Obligation updated."
                                                                });

                                                                setEditingObligationId(
                                                                    ""
                                                                );

                                                            } catch (error) {

                                                                toast({
                                                                    type: "error",
                                                                    message:
                                                                        error instanceof Error
                                                                            ? error.message
                                                                            : "Unable to update obligation."
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
                                                            setEditingObligationId(
                                                                ""
                                                            )
                                                        }
                                                    >
                                                        <X
                                                            className="h-4 w-4"
                                                        />
                                                    </button>
                                                </div>
                                            </>
                                        )
                                        : (
                                            <>
                                                <div className="space-y-3">

                                                    <div>
                                                        <p className="font-semibold text-stone-950">
                                                            {obligation.name}
                                                        </p>

                                                        <p className="text-sm text-stone-500">
                                                            {formatRecurrence(
                                                                obligation.recurrenceType
                                                            )}
                                                            {" • "}
                                                            {formatFundingRule(
                                                                obligation.fundingRule
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div className="space-y-1">

                                                        <p className="text-lg font-semibold text-stone-950">
                                                            {formatCurrency(
                                                                obligation.amount
                                                            )}
                                                        </p>

                                                        <p className="text-sm text-stone-500">
                                                            Due Day {obligation.dueDay}
                                                        </p>
                                                        <p className="text-sm text-stone-500">
                                                            {
                                                                daysUntilDue < 0
                                                                    ? `${Math.abs(daysUntilDue)} days overdue`
                                                                    : daysUntilDue === 0
                                                                        ? "Due today"
                                                                        : `${dueInfo.paidForCurrentPeriod ? "Next due" : "Due"} in ${daysUntilDue} days`
                                                            }
                                                        </p>

                                                    </div>

                                                    <span
                                                        className={`inline-flex w-fit rounded-full px-2 py-1 text-xs font-medium ${getStatusClasses(
                                                            status
                                                        )}`}
                                                    >
                                                        {status}
                                                    </span>

                                                    <div className="flex gap-2">

                                                        {!dueInfo.paidForCurrentPeriod && (
                                                            <button
                                                                type="button"
                                                                title="Mark as paid"
                                                                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-emerald-300 bg-white px-3 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
                                                                onClick={() =>
                                                                    setMarkingPaidId(
                                                                        markingPaidId ===
                                                                            obligation.id
                                                                            ? ""
                                                                            : obligation.id
                                                                    )
                                                                }
                                                            >
                                                                <HandCoins
                                                                    aria-hidden="true"
                                                                    className="h-4 w-4"
                                                                />
                                                                Mark paid
                                                            </button>
                                                        )}

                                                        {dueInfo.paidForCurrentPeriod &&
                                                            dueInfo.currentPeriodKey && (
                                                                <button
                                                                    type="button"
                                                                    title="Undo payment"
                                                                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
                                                                    onClick={async () => {

                                                                        const confirmed =
                                                                            await confirm({
                                                                                title: "Undo payment?",
                                                                                message: `${obligation.name} will show as unpaid again. Any expense recorded with it will be removed.`,
                                                                                confirmLabel: "Undo",
                                                                                tone: "warning"
                                                                            });

                                                                        if (!confirmed) {
                                                                            return;
                                                                        }

                                                                        await unmarkObligationPaid(
                                                                            obligation.id,
                                                                            dueInfo.currentPeriodKey!
                                                                        );

                                                                        toast({
                                                                            type: "success",
                                                                            message: "Payment undone."
                                                                        });
                                                                    }}
                                                                >
                                                                    <Undo2
                                                                        aria-hidden="true"
                                                                        className="h-4 w-4"
                                                                    />
                                                                    Undo
                                                                </button>
                                                            )}

                                                        <button
                                                            type="button"
                                                            title="Edit obligation"
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-600 transition hover:bg-stone-50 hover:text-stone-950"
                                                            onClick={() => {

                                                                setEditingObligationId(
                                                                    obligation.id
                                                                );

                                                                setEditName(
                                                                    obligation.name
                                                                );

                                                                setEditAmount(
                                                                    obligation.amount.toString()
                                                                );

                                                                setEditDueDay(
                                                                    obligation.dueDay.toString()
                                                                );
                                                            }}
                                                        >
                                                            <Pencil
                                                                className="h-4 w-4"
                                                            />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            title="Delete obligation"
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                                                            onClick={async () => {

                                                                const confirmed =
                                                                    await confirm({
                                                                        title:
                                                                            "Delete obligation?",
                                                                        message:
                                                                            `Delete "${obligation.name}"?`,
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

                                                                await deactivateObligation(
                                                                    obligation.id
                                                                );

                                                                toast({
                                                                    type: "success",
                                                                    message:
                                                                        "Obligation deleted."
                                                                });
                                                            }}
                                                        >
                                                            <Trash2
                                                                className="h-4 w-4"
                                                            />
                                                        </button>
                                                    </div>

                                                </div>

                                                {markingPaidId ===
                                                    obligation.id && (
                                                        <MarkPaidForm
                                                            obligation={obligation}
                                                            onClose={() =>
                                                                setMarkingPaidId("")
                                                            }
                                                        />
                                                    )}
                                            </>
                                        )
                                }

                            </div>
                        );
                    }
                )}

            </div>

        </section>
    );
}