import { useLiveQuery }
    from "dexie-react-hooks";

import {
    getObligations
} from "../obligations/obligation.service";

import {
    getDaysUntilDue
} from "../obligations/getDaysUntilDue";

import {
    getObligationStatus
} from "../obligations/getObligationStatus";

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

export default function UpcomingObligations() {

    const obligations =
        useLiveQuery(
            () => getObligations(),
            []
        );

    const upcoming =
        obligations?.filter(
            obligation => {

                const daysUntilDue =
                    getDaysUntilDue(
                        obligation.dueDay
                    );

                const status =
                    getObligationStatus(
                        daysUntilDue
                    );

                return (
                    status ===
                    "Prepare Funds" ||
                    status ===
                    "Due Soon"
                );
            }
        ) ?? [];


    const upcomingTotal =
        upcoming.reduce(
            (
                total,
                obligation
            ) =>
                total +
                obligation.amount,
            0
        );

    return (
        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-base font-semibold text-stone-950">
                        Upcoming Obligations
                    </h2>
                    <p className="text-sm text-stone-500">
                        Payments that need attention
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-xs font-medium text-stone-500">
                        Total
                    </p>
                    <p className="text-sm font-semibold text-amber-700">
                        {formatCurrency(upcomingTotal)}
                    </p>
                </div>
            </div>

            {upcoming.length === 0
                ? (
                    <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                        No obligations requiring attention.
                    </div>
                )
                : (
                    <div className="space-y-2">
                        {upcoming.map(
                            obligation => {

                                const daysUntilDue =
                                    getDaysUntilDue(
                                        obligation.dueDay
                                    );

                                return (
                                    <div
                                        key={obligation.id}
                                        className="flex items-center justify-between gap-3 rounded-md border border-stone-200 px-3 py-2"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-stone-950">
                                                {obligation.name}
                                            </p>
                                            <p className="text-xs text-stone-500">
                                                {daysUntilDue === 0
                                                    ? "Due today"
                                                    : `Due in ${daysUntilDue} days`}
                                            </p>
                                        </div>

                                        <p className="shrink-0 text-sm font-semibold text-stone-950">
                                            {formatCurrency(obligation.amount)}
                                        </p>
                                    </div>
                                );
                            }
                        )}
                    </div>
                )}
        </section>
    );
}
