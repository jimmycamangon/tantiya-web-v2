import { useLiveQuery }
    from "dexie-react-hooks";

import { Archive }
    from "lucide-react";

import {
    useConfirmDialog,
    useToast
} from "../../components/AppFeedback";

import {
    getCategories,
    archiveCategory
} from "./category.service";

export default function CategoryList() {

    const categories =
        useLiveQuery(
            () => getCategories(),
            []
        );

    const confirm =
        useConfirmDialog();

    const toast =
        useToast();

    return (
        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">

            <div className="mb-4">
                <h2 className="text-base font-semibold text-stone-950">
                    Active Categories
                </h2>

                <p className="text-sm text-stone-500">
                    Categories currently available for use.
                </p>
            </div>

            {!categories ||
                categories.length === 0 ? (

                <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                    No categories available.
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
                                    title="Archive category"
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-600 transition hover:bg-stone-50 hover:text-stone-950"
                                    onClick={async () => {

                                        const confirmed =
                                            await confirm({
                                                title: "Archive category?",
                                                message: `Archive "${category.name}"?`,
                                                confirmLabel: "Archive"
                                            });

                                        if (
                                            !confirmed
                                        ) {
                                            return;
                                        }

                                        await archiveCategory(
                                            category.id
                                        );

                                        toast({
                                            type: "success",
                                            message: "Category archived."
                                        });
                                    }}
                                >
                                    <Archive
                                        className="h-4 w-4"
                                    />
                                </button>

                            </div>
                        )
                    )}

                </div>

            )}

        </section>
    );
}