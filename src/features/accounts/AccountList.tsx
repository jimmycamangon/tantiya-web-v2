
import { useState }
    from "react";

import { useLiveQuery }
    from "dexie-react-hooks";
import { db }
    from "../../db/database";

import {
    updateAccount,
    archiveAccount
} from "./account.service";
import { calculateAccountBalance } from "./accountBalance.service";

export default function AccountList() {

    const [
        editingAccountId,
        setEditingAccountId
    ] = useState("");

    const [
        editName,
        setEditName
    ] = useState("");

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

    return (
        <ul>

            {accountsWithBalance?.map(
                account => (
                    <li
                        key={
                            account.id
                        }
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
                                        />

                                        <button
                                            onClick={async () => {

                                                await updateAccount(
                                                    account.id,
                                                    editName
                                                );

                                                setEditingAccountId(
                                                    ""
                                                );
                                            }}
                                        >
                                            Save
                                        </button>

                                        <button
                                            onClick={() =>
                                                setEditingAccountId(
                                                    ""
                                                )
                                            }
                                        >
                                            Cancel
                                        </button>
                                    </>
                                )
                                : (
                                    <>
                                        {
                                            account.name
                                        }
                                        {" - ₱"}
                                        {
                                            account.balance.toLocaleString()
                                        }

                                        <button
                                            onClick={() => {

                                                setEditingAccountId(
                                                    account.id
                                                );

                                                setEditName(
                                                    account.name
                                                );
                                            }}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={async () => {

                                                const confirmed =
                                                    confirm(
                                                        `Archive '${account.name}'?`
                                                    );

                                                if (
                                                    !confirmed
                                                ) {
                                                    return;
                                                }

                                                await archiveAccount(
                                                    account.id
                                                );
                                            }}
                                        >
                                            Archive
                                        </button>
                                    </>
                                )
                        }

                    </li>
                )
            )}

        </ul>
    );
}

