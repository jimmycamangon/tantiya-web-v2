import { useLiveQuery }
    from "dexie-react-hooks";

import { RotateCcw }
    from "lucide-react";

import { useToast }
    from "../../components/AppFeedback";

import {
    getArchivedCategories,
    restoreCategory
} from "./category.service";

export default function ArchivedCategoryList() {

    const categories =
        useLiveQuery(
            () =>
                getArchivedCategories(),
            []
        );

    const toast =
        useToast();

    return (
        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">

            <div className="mb-4">
                <h2 className="text-base font-semibold text-stone-950">
                    Archived Categories
                </h2>

                <p className="text-sm text-stone-500">
                    Previously archived categories that can still be restored.
                </p>
            </div>

            {!categories ||
                categories.length === 0 ? (

                <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                    No archived categories.
                </div>

            ) : (

                <div className="divide-y divide-stone-100 overflow-hidden rounded-md border border-stone-200">

                    {categories.map(
                        category => (

                            <div
                                key={category.id}
                                className="flex items-center justify-between px-4 py-3"
                            >

                                <span className="font-medium text-stone-950">
                                    {category.name}
                                </span>

                                <button
                                    type="button"
                                    className="inline-flex h-9 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-600 transition hover:bg-stone-50 hover:text-stone-950"
                                    onClick={async () => {

                                        await restoreCategory(
                                            category.id
                                        );

                                        toast({
                                            type: "success",
                                            message: "Category restored."
                                        });
                                    }}
                                >
                                    <RotateCcw
                                        className="h-4 w-4"
                                    />

                                    Restore
                                </button>

                            </div>
                        )
                    )}

                </div>

            )}

        </section>
    );
}