import AddAccountForm
    from "../features/accounts/AddAccountForm";

import AccountList
    from "../features/accounts/AccountList";

import ArchivedAccountList
    from "../features/accounts/ArchivedAccountList";


export default function AccountsPage() {

    return (
        <>
            <AddAccountForm />

            <h2>
                Active Accounts
            </h2>

            <AccountList />

            <hr />

            <h2>
                Archived Accounts
            </h2>

            <ArchivedAccountList />
        </>
    );
}