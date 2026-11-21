import { useRef, useState }
    from "react";
import type { ChangeEvent }
    from "react";
import { Upload }
    from "lucide-react";
import {
    useConfirmDialog,
    useToast
} from "../../components/AppFeedback";
import { db }
    from "../../db/database";
import type { Account }
    from "../../types/account";
import type { Adjustment }
    from "../../types/adjustment";
import type { Category }
    from "../../types/category";
import type { Cutoff }
    from "../../types/cutoff";
import type { Expense }
    from "../../types/expense";
import type { Income }
    from "../../types/income";
import type { Obligation }
    from "../../types/obligation";
import type { ObligationPayment }
    from "../../types/obligationPayment";
import type { Transfer }
    from "../../types/transfer";

type BackupData = {
    accounts?: Account[];
    categories?: Category[];
    cutoffs?: Cutoff[];
    incomes?: Income[];
    expenses?: Expense[];
    obligations?: Obligation[];
    transfers?: Transfer[];
    adjustments?: Adjustment[];
    obligationPayments?: ObligationPayment[];
};

function getTableData<Key extends keyof BackupData>(
    backup: BackupData,
    key: Key
): NonNullable<BackupData[Key]> {
    const value =
        backup[key];

    if (!value) {
        return [] as NonNullable<BackupData[Key]>;
    }

    if (!Array.isArray(value)) {
        throw new Error(
            `Invalid backup format: "${key}" must be an array.`
        );
    }

    return value as NonNullable<BackupData[Key]>;
}

export default function ImportBackupButton() {

    const inputRef =
        useRef<HTMLInputElement>(null);

    const [isImporting,
        setIsImporting] =
        useState(false);

    const confirm =
        useConfirmDialog();

    const toast =
        useToast();

    async function handleImport(
        event: ChangeEvent<HTMLInputElement>
    ) {

        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        const confirmed =
            await confirm({
                title: "Replace all data?",
                message: "This will overwrite your current accounts, categories, income, expenses, transfers, obligations, and adjustments.",
                confirmLabel: "Import Backup",
                tone: "danger"
            });

        if (!confirmed) {
            event.target.value =
                "";

            return;
        }

        setIsImporting(
            true
        );

        try {
            const text =
                await file.text();

            const backup =
                JSON.parse(text) as BackupData;

            await db.transaction(
                "rw",
                [
                    db.accounts,
                    db.categories,
                    db.cutoffs,
                    db.incomes,
                    db.expenses,
                    db.obligations,
                    db.transfers,
                    db.adjustments,
                    db.obligationPayments
                ],
                async () => {
                    await db.accounts.clear();
                    await db.categories.clear();
                    await db.cutoffs.clear();
                    await db.incomes.clear();
                    await db.expenses.clear();
                    await db.obligations.clear();
                    await db.transfers.clear();
                    await db.adjustments.clear();
                    await db.obligationPayments.clear();

                    await db.accounts.bulkAdd(
                        getTableData(backup, "accounts")
                    );

                    await db.categories.bulkAdd(
                        getTableData(backup, "categories")
                    );

                    await db.cutoffs.bulkAdd(
                        getTableData(backup, "cutoffs")
                    );

                    await db.incomes.bulkAdd(
                        getTableData(backup, "incomes")
                    );

                    await db.expenses.bulkAdd(
                        getTableData(backup, "expenses")
                    );

                    await db.obligations.bulkAdd(
                        getTableData(backup, "obligations")
                    );

                    await db.transfers.bulkAdd(
                        getTableData(backup, "transfers")
                    );

                    await db.adjustments.bulkAdd(
                        getTableData(backup, "adjustments")
                    );

                    await db.obligationPayments.bulkAdd(
                        getTableData(backup, "obligationPayments")
                    );
                }
            );

            toast({
                type: "success",
                message: "Backup restored successfully."
            });

            window.setTimeout(
                () => window.location.reload(),
                650
            );
        } catch (error) {
            console.error(
                error
            );

            toast({
                type: "error",
                message: error instanceof Error
                    ? error.message
                    : "Backup import failed."
            });
        } finally {
            event.target.value =
                "";

            setIsImporting(
                false
            );
        }
    }

    return (
        <>
            <input
                ref={inputRef}
                className="sr-only"
                type="file"
                accept=".json,application/json"
                onChange={handleImport}
            />

            <button
                type="button"
                disabled={isImporting}
                onClick={() =>
                    inputRef.current?.click()
                }
                className="inline-flex items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 shadow-sm transition hover:bg-stone-50 disabled:border-stone-200 disabled:text-stone-400"
            >
                <Upload
                    aria-hidden="true"
                    className="h-4 w-4"
                />
                {isImporting
                    ? "Importing..."
                    : "Import Backup"}
            </button>
        </>
    );
}
