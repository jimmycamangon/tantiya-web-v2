import { useState }
    from "react";
import { Download }
    from "lucide-react";
import { useToast }
    from "../../components/AppFeedback";
import { db }
    from "../../db/database";

export default function ExportBackupButton() {

    const [isExporting,
        setIsExporting] =
        useState(false);

    const toast =
        useToast();

    async function exportBackup() {

        setIsExporting(
            true
        );

        try {
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

            toast({
                type: "success",
                message: "Backup downloaded."
            });
        } finally {
            setIsExporting(
                false
            );
        }
    }

    return (

        <button
            type="button"
            disabled={isExporting}
            onClick={
                exportBackup
            }
            className="inline-flex items-center justify-center gap-2 rounded-md bg-stone-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 disabled:bg-stone-300"
        >
            <Download
                aria-hidden="true"
                className="h-4 w-4"
            />
            {isExporting
                ? "Preparing..."
                : "Export Backup"}
        </button>

    );
}
