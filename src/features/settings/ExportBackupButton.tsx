import { db }
    from "../../db/database";

export default function ExportBackupButton() {

    async function exportBackup() {

        const backup = {

            version: 1,

            exportedAt:
                new Date()
                    .toISOString(),

            accounts:
                await db.accounts.toArray(),

            categories:
                await db.categories.toArray(),

            incomes:
                await db.incomes.toArray(),

            expenses:
                await db.expenses.toArray(),

            obligations:
                await db.obligations.toArray(),

            transfers:
                await db.transfers.toArray(),

            adjustments:
                await db.adjustments.toArray(),

            cutoffs:
                await db.cutoffs.toArray()
        };

        const json =
            JSON.stringify(
                backup,
                null,
                2
            );

        const blob =
            new Blob(
                [json],
                {
                    type:
                        "application/json"
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const link =
            document.createElement(
                "a"
            );

        link.href =
            url;

        link.download =
            `tantiya-backup-${new Date()
                .toISOString()
                .slice(0, 10)}.json`;

        link.click();

        URL.revokeObjectURL(
            url
        );
    }

    return (

        <button
            onClick={
                exportBackup
            }
        >
            Export Backup
        </button>

    );
}