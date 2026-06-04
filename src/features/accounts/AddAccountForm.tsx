import { useState }
    from "react";
import type { FormEvent }
    from "react";
import { Plus }
    from "lucide-react";
import { useToast }
    from "../../components/AppFeedback";
import { createAccount }
    from "./account.service";

export default function AddAccountForm() {
    const [name, setName] = useState("");
    const [openingBalance, setOpeningBalance] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const toast =
        useToast();

    const handleSubmit = async (
        e: FormEvent
    ) => {
        e.preventDefault();

        if (!name.trim()) return;

        setIsSaving(
            true
        );

        try {
            await createAccount(
                name,
                Number(openingBalance) || 0
            );

            toast({
                type: "success",
                message: "Account added."
            });

            setName("");
            setOpeningBalance("");
        } catch (error) {
            toast({
                type: "error",
                message: "Account already exists."
            });
        } finally {
            setIsSaving(
                false
            );
        }
    };

    return (
        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4">
                <h2 className="text-base font-semibold text-stone-950">
                    Add Account
                </h2>
                <p className="text-sm text-stone-500">
                    Create a wallet, bank account, or cash bucket.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="grid gap-3 lg:grid-cols-[1fr_180px_auto]"
            >
                <label className="grid gap-1">
                    <span className="text-xs font-medium text-stone-500">
                        Account Name
                    </span>
                    <input
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        placeholder="e.g. BPI Savings"
                        className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                </label>

                <label className="grid gap-1">
                    <span className="text-xs font-medium text-stone-500">
                        Opening Balance
                    </span>
                    <input
                        type="number"
                        step="0.01"
                        value={openingBalance}
                        onChange={(e) =>
                            setOpeningBalance(
                                e.target.value
                            )
                        }
                        placeholder="0.00"
                        className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                </label>

                <button
                    type="submit"
                    disabled={isSaving || !name.trim()}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 disabled:bg-stone-300 lg:self-end"
                >
                    <Plus
                        aria-hidden="true"
                        className="h-4 w-4"
                    />
                    {isSaving
                        ? "Adding..."
                        : "Add"}
                </button>
            </form>
        </section>
    );
}
