import { useLiveQuery }
    from "dexie-react-hooks";

import {
    getTopSpendingCategories
} from "./topSpending.service";

export default function TopSpendingCategories() {

    const categories =
        useLiveQuery(
            () =>
                getTopSpendingCategories(),
            []
        ) ?? [];

    return (
        <div>

            <h3>
                Top Spending Categories
            </h3>

            {
                categories.length === 0
                    ? (
                        <div>
                            No expenses this month.
                        </div>
                    )
                    : (
                        <ul>

                            {categories.map(
                                category => (

                                    <li
                                        key={
                                            category.categoryName
                                        }
                                    >

                                        {
                                            category.categoryName
                                        }

                                        {" - ₱"}

                                        {
                                            category.amount.toFixed(
                                                2
                                            )
                                        }

                                    </li>
                                )
                            )}

                        </ul>
                    )
            }

        </div>
    );
}