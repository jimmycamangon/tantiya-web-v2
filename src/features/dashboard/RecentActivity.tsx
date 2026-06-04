import { useLiveQuery }
    from "dexie-react-hooks";

import {
    getRecentActivity
} from "./recentActivity.service";

function formatCurrency(
    amount: number
) {
    return new Intl.NumberFormat(
        "en-PH",
        {
            style: "currency",
            currency: "PHP"
        }
    ).format(
        amount
    );
}

function formatDate(
    date: string
) {
    return new Intl.DateTimeFormat(
        "en-PH",
        {
            month: "short",
            day: "numeric"
        }
    ).format(
        new Date(date)
    );
}

export default function RecentActivity() {

    const activities =
        useLiveQuery(
            () =>
                getRecentActivity(),
            []
        ) ?? [];

    return (
        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <div className="mb-4">
                <h2 className="text-base font-semibold text-stone-950">
                    Recent Activity
                </h2>
                <p className="text-sm text-stone-500">
                    Latest money movement across the tracker
                </p>
            </div>

            {activities.length === 0
                ? (
                    <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                        No recent activity.
                    </div>
                )
                : (
                    <div className="divide-y divide-stone-100 overflow-hidden rounded-md border border-stone-200">
                        {activities.map(
                            (
                                activity,
                                index
                            ) => (

                                <div
                                    key={index}
                                    className="grid gap-2 px-3 py-3 text-sm sm:grid-cols-[96px_120px_1fr_auto] sm:items-center"
                                >
                                    <p className="text-stone-500">
                                        {formatDate(activity.date)}
                                    </p>

                                    <p className="w-fit rounded-full bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700">
                                        {activity.type}
                                    </p>

                                    <p className="min-w-0 truncate font-medium text-stone-950">
                                        {activity.description}
                                    </p>

                                    <p className="font-semibold text-stone-800 sm:text-right">
                                        {formatCurrency(activity.amount)}
                                    </p>
                                </div>
                            )
                        )}
                    </div>
                )}
        </section>
    );
}
