import AddCategoryForm
    from "../features/categories/AddCategoryForm";

import CategoryList
    from "../features/categories/CategoryList";

import ArchivedCategoryList
    from "../features/categories/ArchivedCategoryList";

export default function CategoriesPage() {

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-emerald-700">
                    Organization
                </p>
                <h1 className="text-2xl font-semibold text-stone-950 sm:text-3xl">
                    Categories
                </h1>
                <p className="max-w-2xl text-sm text-stone-500">
                    Manage categories used for expenses and budgeting.
                </p>
            </div>

            <AddCategoryForm />

            <CategoryList />

            <ArchivedCategoryList />

        </div>
    );
}