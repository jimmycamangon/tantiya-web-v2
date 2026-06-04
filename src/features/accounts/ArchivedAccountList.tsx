import { useLiveQuery }
    from "dexie-react-hooks";

import {
    getArchivedAccounts,
    restoreAccount
} from "./account.service";

export default function ArchivedAccountList() {

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
            <div>
                No archived accounts.
            </div>
        );
    }

    return (
        <ul>

            {accounts.map(
                account => (

                    <li
                        key={
                            account.id
                        }
                    >

                        {
                            account.name
                        }

                        <button
                            onClick={async () => {

                                await restoreAccount(
                                    account.id
                                );
                            }}
                        >
                            Restore
                        </button>

                    </li>
                )
            )}

        </ul>
    );
}