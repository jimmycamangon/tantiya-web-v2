import { useState }
    from "react";

import {
    createCategory
} from "./category.service";

export default function AddCategoryForm() {

    const [name,
        setName] =
        useState("");

    async function handleSubmit(
        e: React.FormEvent
    ) {

        e.preventDefault();

        if (
            !name.trim()
        ) {
            return;
        }

        try {

            await createCategory(
                name
            );

            setName("");

        } catch {

            alert(
                "Category already exists"
            );
        }
    }

    return (
        <form
            onSubmit={
                handleSubmit
            }
        >

            <input
                value={name}
                onChange={(e) =>
                    setName(
                        e.target.value
                    )
                }
                placeholder="Category Name"
            />

            <button
                type="submit"
            >
                Add Category
            </button>

        </form>
    );
}