import { useLiveQuery }
    from "dexie-react-hooks";
import { RotateCcw }
    from "lucide-react";
import { useToast }
    from "../../components/AppFeedback";

import {
    getArchivedAccounts,
    restoreAccount
} from "./account.service";

export default function ArchivedAccountList() {

    const toast =
        useToast();

    const accounts =
        useLiveQuery(
            () =>
                getArchivedAccounts(),
            []
        );

    if (
        !accounts ||
        accounts.length === 0
    ) {
        return (
            <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                No archived accounts.
            </div>
        );
    }

    return (
        <div className="divide-y divide-stone-100 overflow-hidden rounded-md border border-stone-200">

            {accounts.map(
                account => (

                    <div
                        key={
                            account.id
                        }
                        className="flex items-center justify-between gap-3 px-3 py-3"
                    >

                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-stone-700">
                                {account.name}
                            </p>
                            <p className="text-xs text-stone-500">
                                Archived account
                            </p>
                        </div>

                        <button
                            type="button"
                            title="Restore account"
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 hover:text-stone-950"
                            onClick={async () => {

                                await restoreAccount(
                                    account.id
                                );

                                toast({
                                    type: "success",
                                    message: "Account restored."
                                });
                            }}
                        >
                            <RotateCcw
                                aria-hidden="true"
                                className="h-4 w-4"
                            />
                            Restore
                        </button>

                    </div>
                )
            )}

        </div>
    );
}
