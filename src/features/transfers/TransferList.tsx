import { useState }
    from "react";

import { useLiveQuery }
    from "dexie-react-hooks";

import { db }
    from "../../db/database";

import {
    getTransfers,
    updateTransfer,
    softDeleteTransfer
} from "./transfer.service";

export default function TransferList() {

    const transfers =
        useLiveQuery(
            () => getTransfers(),
            []
        );

    const accounts =
        useLiveQuery(
            () => db.accounts.toArray(),
            []
        );

    const [
        editingTransferId,
        setEditingTransferId
    ] = useState("");

    const [
        editAmount,
        setEditAmount
    ] = useState("");

    const [
        editNotes,
        setEditNotes
    ] = useState("");

    function getAccountName(
        accountId: string
    ) {
        return (
            accounts?.find(
                account =>
                    account.id ===
                    accountId
            )?.name ??
            "Unknown"
        );
    }

    return (
        <ul>

            {transfers?.map(
                transfer => (

                    <li
                        key={
                            transfer.id
                        }
                    >

                        {
                            editingTransferId === transfer.id
                                ? (
                                    <div>

                                        <div>
                                            {transfer.date.slice(0, 10)}
                                            {" | "}
                                            {getAccountName(
                                                transfer.fromAccountId
                                            )}
                                            {" → "}
                                            {getAccountName(
                                                transfer.toAccountId
                                            )}
                                        </div>

                                        <div>
                                            <input
                                                type="number"
                                                value={editAmount}
                                                onChange={(e) =>
                                                    setEditAmount(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div>
                                            <input
                                                value={editNotes}
                                                onChange={(e) =>
                                                    setEditNotes(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div>
                                            <button
                                                onClick={async () => {

                                                    await updateTransfer(
                                                        transfer.id,
                                                        {
                                                            amount: Number(
                                                                editAmount
                                                            ),
                                                            notes:
                                                                editNotes
                                                        }
                                                    );

                                                    setEditingTransferId(
                                                        ""
                                                    );
                                                }}
                                            >
                                                Save
                                            </button>

                                            <button
                                                onClick={() =>
                                                    setEditingTransferId(
                                                        ""
                                                    )
                                                }
                                            >
                                                Cancel
                                            </button>
                                        </div>

                                    </div>
                                )
                                : (
                                    <>

                                        {
                                            transfer.date.slice(
                                                0,
                                                10
                                            )
                                        }

                                        {" | "}

                                        {
                                            getAccountName(
                                                transfer.fromAccountId
                                            )
                                        }

                                        {" → "}

                                        {
                                            getAccountName(
                                                transfer.toAccountId
                                            )
                                        }

                                        {" | ₱"}

                                        {
                                            transfer.amount
                                        }

                                        {" | "}

                                        {
                                            transfer.notes
                                        }

                                        <button
                                            onClick={() => {

                                                setEditingTransferId(
                                                    transfer.id
                                                );

                                                setEditAmount(
                                                    transfer.amount.toString()
                                                );

                                                setEditNotes(
                                                    transfer.notes ??
                                                    ""
                                                );
                                            }}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => {

                                                const confirmed =
                                                    confirm(
                                                        "Delete transfer?"
                                                    );

                                                if (
                                                    !confirmed
                                                ) {
                                                    return;
                                                }

                                                softDeleteTransfer(
                                                    transfer.id
                                                );
                                            }}
                                        >
                                            Delete
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