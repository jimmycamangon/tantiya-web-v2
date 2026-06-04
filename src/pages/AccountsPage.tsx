import AddAccountForm
    from "../features/accounts/AddAccountForm";

import AccountList
    from "../features/accounts/AccountList";

import ArchivedAccountList
    from "../features/accounts/ArchivedAccountList";


export default function AccountsPage() {

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-emerald-700">
                    Wallets
                </p>
                <h1 className="text-2xl font-semibold text-stone-950 sm:text-3xl">
                    Accounts
                </h1>
                <p className="max-w-2xl text-sm text-stone-500">
                    Keep track of cash sources, wallets, bank accounts, and their usable balances.
                </p>
            </div>

            <AddAccountForm />

            <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4">
                    <h2 className="text-base font-semibold text-stone-950">
                        Active Accounts
                    </h2>
                    <p className="text-sm text-stone-500">
                        Accounts included in your current balance.
                    </p>
                </div>

                <AccountList />
            </section>

            <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4">
                    <h2 className="text-base font-semibold text-stone-950">
                        Archived Accounts
                    </h2>
                    <p className="text-sm text-stone-500">
                        Hidden accounts that can be restored anytime.
                    </p>
                </div>

                <ArchivedAccountList />
            </section>
        </div>
    );
}
