import { useState } from "react";
import { Plus } from "lucide-react";

import { useToast }
    from "../../components/AppFeedback";

import {
    createCategory
} from "./category.service";

export default function AddCategoryForm() {

    const [name,
        setName] =
        useState("");

    const toast =
        useToast();

    async function handleSubmit(
        e: React.FormEvent
    ) {

        e.preventDefault();

        if (
            !name.trim()
        ) {
            toast({
                type: "warning",
                message: "Enter a category name."
            });

            return;
        }

        try {

            await createCategory(
                name.trim()
            );

            toast({
                type: "success",
                message: "Category added."
            });

            setName("");

        } catch {

            toast({
                type: "error",
                message: "Category already exists."
            });
        }
    }

    return (
        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">

            <div className="mb-4">
                <h2 className="text-base font-semibold text-stone-950">
                    Add Category
                </h2>

                <p className="text-sm text-stone-500">
                    Create a category for organizing expenses.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-3 sm:flex-row"
            >

                <input
                    value={name}
                    onChange={(e) =>
                        setName(
                            e.target.value
                        )
                    }
                    placeholder="Category Name"
                    className="h-10 flex-1 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />

                <button
                    type="submit"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800"
                >
                    <Plus
                        className="h-4 w-4"
                    />

                    Add Category
                </button>

            </form>

        </section>
    );
}