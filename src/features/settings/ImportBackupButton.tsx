import { db }
    from "../../db/database";

export default function ImportBackupButton() {

    async function handleImport(
        event: React.ChangeEvent<HTMLInputElement>
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
            return;
        }

        const text =
            await file.text();

        const backup =
            JSON.parse(text);

        await db.transaction(
            "rw",
            db.tables,
            async () => {

                db.accounts,
                    db.categories,
                    db.cutoffs,
                    db.incomes,
                    db.expenses,
                    db.obligations,
                    db.transfers,
                    db.adjustments,

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
                            backup.accounts ?? []
                        );

                        await db.categories.bulkAdd(
                            backup.categories ?? []
                        );

                        await db.cutoffs.bulkAdd(
                            backup.cutoffs ?? []
                        );

                        await db.incomes.bulkAdd(
                            backup.incomes ?? []
                        );

                        await db.expenses.bulkAdd(
                            backup.expenses ?? []
                        );

                        await db.obligations.bulkAdd(
                            backup.obligations ?? []
                        );

                        await db.transfers.bulkAdd(
                            backup.transfers ?? []
                        );

                        await db.adjustments.bulkAdd(
                            backup.adjustments ?? []
                        );
                    }
            }
        );

        alert(
            "Backup imported successfully."
        );

        window.location.reload();
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