import AddCategoryForm
    from "../features/categories/AddCategoryForm";

import CategoryList
    from "../features/categories/CategoryList";

import ArchivedCategoryList
    from "../features/categories/ArchivedCategoryList";

export default function CategoriesPage() {

    return (
        <>

            <h1>
                Categories
            </h1>

            <AddCategoryForm />

            <hr />

            <h2>
                Active Categories
            </h2>

            <CategoryList />

            <hr />

            <h2>
                Archived Categories
            </h2>

            <ArchivedCategoryList />

        </>
    );
}