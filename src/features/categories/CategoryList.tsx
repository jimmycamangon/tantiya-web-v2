import { useLiveQuery }
    from "dexie-react-hooks";

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

    return (
        <ul>

            {categories?.map(
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

                                const confirmed =
                                    confirm(
                                        `Archive '${category.name}'?`
                                    );

                                if (
                                    !confirmed
                                ) {
                                    return;
                                }

                                await archiveCategory(
                                    category.id
                                );
                            }}
                        >
                            Archive
                        </button>

                    </li>
                )
            )}

        </ul>
    );
}