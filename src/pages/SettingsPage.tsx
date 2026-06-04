import { AlertTriangle, Database }
    from "lucide-react";
import ExportBackupButton from "../features/settings/ExportBackupButton";
import ImportBackupButton
    from "../features/settings/ImportBackupButton";

export default function SettingsPage() {

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-emerald-700">
                    System
                </p>
                <h1 className="text-2xl font-semibold text-stone-950 sm:text-3xl">
                    Settings
                </h1>
                <p className="max-w-2xl text-sm text-stone-500">
                    Manage backup files and restore your local Tantiya data.
                </p>
            </div>

            <section className="max-w-3xl rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                            <Database
                                aria-hidden="true"
                                className="h-5 w-5"
                            />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold text-stone-950">
                                Backup & Restore
                            </h2>
                            <p className="mt-1 text-sm text-stone-500">
                                Export a JSON snapshot or import a previous backup into this browser.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <ExportBackupButton />
                        <ImportBackupButton />
                    </div>
                </div>

                <div className="mt-5 flex gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    <AlertTriangle
                        aria-hidden="true"
                        className="mt-0.5 h-4 w-4 shrink-0"
                    />
                    <p>
                        Importing a backup replaces all current accounts, categories, income, expenses, transfers, obligations, and adjustments.
                    </p>
                </div>
            </section>
        </div>
    );
}
