
import { useState }
    from "react";

import { useLiveQuery }
    from "dexie-react-hooks";
import { Archive, Check, Pencil, Scale, X }
    from "lucide-react";
import {
    useConfirmDialog,
    useToast
} from "../../components/AppFeedback";
import { db }
    from "../../db/database";

import {
    updateAccount,
    archiveAccount
} from "./account.service";
import { calculateAccountBalance } from "./accountBalance.service";

import AdjustBalanceForm from "../adjustments/AdjustBalanceForm";

function formatCurrency(
    amount: number
) {
    return new Intl.NumberFormat(
        "en-PH",
        {
            style: "currency",
            currency: "PHP"
        }
    ).format(
        amount
    );
}

export default function AccountList() {

    const [
        editingAccountId,
        setEditingAccountId
    ] = useState("");

    const [
        editName,
        setEditName
    ] = useState("");

    const [
        adjustingAccountId,
        setAdjustingAccountId
    ] = useState("");

    const confirm =
        useConfirmDialog();

    const toast =
        useToast();

    const accountsWithBalance = useLiveQuery(async () => {
        const accounts =
            await db.accounts
                .filter(
                    account =>
                        !account.archived
                )
                .toArray();

        const accountsWithBalance = await Promise.all(
            accounts.map(async account => ({
                ...account,
                balance: await calculateAccountBalance(
                    account.id
                ),
            }))
        );

        return accountsWithBalance;
    }, []);

    if (
        !accountsWithBalance ||
        accountsWithBalance.length === 0
    ) {
        return (
            <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                No active accounts yet.
            </div>
        );
    }

    return (
        <div className="divide-y divide-stone-100 overflow-hidden rounded-md border border-stone-200">

            {accountsWithBalance.map(
                account => (
                    <div
                        key={
                            account.id
                        }
                        className="grid gap-3 px-3 py-3 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                    >

                        {
                            editingAccountId ===
                                account.id
                                ? (
                                    <>
                                        <input
                                            value={
                                                editName
                                            }
                                            onChange={(e) =>
                                                setEditName(
                                                    e.target.value
                                                )
                                            }
                                            className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                        />

                                        <div className="text-sm font-semibold text-stone-950 sm:text-right">
                                            {formatCurrency(account.balance)}
                                        </div>

                                        <div className="flex gap-2 sm:justify-end">
                                            <button
                                                type="button"
                                                title="Save account name"
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-emerald-600 text-white transition hover:bg-emerald-700"
                                                onClick={async () => {

                                                    await updateAccount(
                                                        account.id,
                                                        editName
                                                    );

                                                    toast({
                                                        type: "success",
                                                        message: "Account updated."
                                                    });

                                                    setEditingAccountId(
                                                        ""
                                                    );
                                                }}
                                            >
                                                <Check
                                                    aria-hidden="true"
                                                    className="h-4 w-4"
                                                />
                                            </button>

                                            <button
                                                type="button"
                                                title="Cancel editing"
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-600 transition hover:bg-stone-50 hover:text-stone-950"
                                                onClick={() =>
                                                    setEditingAccountId(
                                                        ""
                                                    )
                                                }
                                            >
                                                <X
                                                    aria-hidden="true"
                                                    className="h-4 w-4"
                                                />
                                            </button>
                                        </div>
                                    </>
                                )
                                : (
                                    <>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-stone-950">
                                                {account.name}
                                            </p>
                                            <p className="text-xs text-stone-500">
                                                Active account
                                            </p>
                                        </div>

                                        <div className="text-lg font-semibold text-stone-950 sm:text-right">
                                            {formatCurrency(account.balance)}
                                        </div>

                                        <div className="flex gap-2 sm:justify-end">
                                            <button
                                                type="button"
                                                title="Adjust balance"
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                                                onClick={() =>
                                                    setAdjustingAccountId(
                                                        adjustingAccountId ===
                                                            account.id
                                                            ? ""
                                                            : account.id
                                                    )
                                                }
                                            >
                                                <Scale
                                                    aria-hidden="true"
                                                    className="h-4 w-4"
                                                />
                                            </button>

                                            <button
                                                type="button"
                                                title="Edit account"
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-600 transition hover:bg-stone-50 hover:text-stone-950"
                                                onClick={() => {

                                                    setEditingAccountId(
                                                        account.id
                                                    );

                                                    setEditName(
                                                        account.name
                                                    );
                                                }}
                                            >
                                                <Pencil
                                                    aria-hidden="true"
                                                    className="h-4 w-4"
                                                />
                                            </button>

                                            <button
                                                type="button"
                                                title="Archive account"
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                                                onClick={async () => {

                                                    const confirmed =
                                                        await confirm({
                                                            title: "Archive account?",
                                                            message: `${account.name} will be hidden from active balances. You can restore it later.`,
                                                            confirmLabel: "Archive",
                                                            tone: "warning"
                                                        });

                                                    if (
                                                        !confirmed
                                                    ) {
                                                        return;
                                                    }

                                                    await archiveAccount(
                                                        account.id
                                                    );

                                                    toast({
                                                        type: "success",
                                                        message: "Account archived."
                                                    });
                                                }}
                                            >
                                                <Archive
                                                    aria-hidden="true"
                                                    className="h-4 w-4"
                                                />
                                            </button>
                                        </div>
                                    </>
                                )
                        }

                        {adjustingAccountId ===
                            account.id && (
                                <div className="sm:col-span-3">
                                    <AdjustBalanceForm
                                        accountId={account.id}
                                        accountName={account.name}
                                        currentBalance={account.balance}
                                        onClose={() =>
                                            setAdjustingAccountId("")
                                        }
                                    />
                                </div>
                            )}

                    </div>
                )
            )}

        </div>
    );
}
