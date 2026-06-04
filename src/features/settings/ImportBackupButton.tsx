import { db }
    from "../../db/database";
import type { ChangeEvent }
    from "react";
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

    async function handleImport(
        event: ChangeEvent<HTMLInputElement>
    ) {

        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        const confirmed =
            confirm(
                "This will replace ALL existing data. Continue?"
            );

        if (!confirmed) {
            event.target.value =
                "";

            return;
        }

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
                    db.adjustments
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
                }
            );

            alert(
                "Backup imported successfully."
            );

            window.location.reload();
        } catch (error) {
            console.error(
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : "Backup import failed."
            );
        } finally {
            event.target.value =
                "";
        }
    }

    return (
        <div>

            <input
                type="file"
                accept=".json"
                onChange={handleImport}
            />

        </div>
    );
}
