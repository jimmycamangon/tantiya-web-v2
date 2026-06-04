import { useLiveQuery }
    from "dexie-react-hooks";

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

    if (
        !categories ||
        categories.length === 0
    ) {
        return (
            <div>
                No archived categories.
            </div>
        );
    }

    return (
        <ul>

            {categories.map(
                category => (

                    <li
                        key={
                            category.id
                        }
                    >

                        {
                            category.name
                        }

                        {" "}

                        <button
                            onClick={async () => {

                                await restoreCategory(
                                    category.id
                                );
                            }}
                        >
                            Restore
                        </button>

                    </li>
                )
            )}

        </ul>
    );
}