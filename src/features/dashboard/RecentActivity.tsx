import { useLiveQuery }
    from "dexie-react-hooks";

import {
    getRecentActivity
} from "./recentActivity.service";

export default function RecentActivity() {

    const activities =
        useLiveQuery(
            () =>
                getRecentActivity(),
            []
        ) ?? [];

    return (
        <div>

            <h3>
                Recent Activity
            </h3>

            {
                activities.length === 0
                    ? (
                        <div>
                            No recent activity.
                        </div>
                    )
                    : (
                        <ul>

                            {
                                activities.map(
                                    (
                                        activity,
                                        index
                                    ) => (

                                        <li
                                            key={
                                                index
                                            }
                                        >

                                            {
                                                activity.date.slice(
                                                    0,
                                                    10
                                                )
                                            }

                                            {" | "}

                                            {
                                                activity.type
                                            }

                                            {" | "}

                                            {
                                                activity.description
                                            }

                                            {" | ₱"}

                                            {
                                                activity.amount
                                                    .toFixed(
                                                        2
                                                    )
                                            }

                                        </li>
                                    )
                                )
                            }

                        </ul>
                    )
            }

        </div>
    );
}