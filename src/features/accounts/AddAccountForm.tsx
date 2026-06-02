import { useState } from "react";
import { createAccount } from "./account.service";

export default function AddAccountForm() {
    const [name, setName] = useState("");
    const [openingBalance, setOpeningBalance] = useState("");

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (!name.trim()) return;

        try {
            await createAccount(
                name,
                Number(openingBalance) || 0
            );

            setName("");
            setOpeningBalance("");
        } catch (error) {
            alert("Account already exists");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                value={name}
                onChange={(e) =>
                    setName(e.target.value)
                }
                placeholder="Account Name"
            />

            <input
                type="number"
                value={openingBalance}
                onChange={(e) =>
                    setOpeningBalance(e.target.value)
                }
                placeholder="Opening Balance"
            />

            <button type="submit">
                Add Account
            </button>
        </form>
    );
}