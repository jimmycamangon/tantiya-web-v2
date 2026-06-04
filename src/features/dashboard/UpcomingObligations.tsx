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

    if (
        upcoming.length === 0
    ) {
        return (
            <div>

                <h3>
                    Upcoming Obligations
                </h3>

                <div>
                    No obligations requiring attention.
                </div>

            </div>
        );
    }

    return (
        <div>

            <h3>
                Upcoming Obligations
            </h3>

            <ul>

                {upcoming.map(
                    obligation => {

                        const daysUntilDue =
                            getDaysUntilDue(
                                obligation.dueDay
                            );

                        return (
                            <li
                                key={
                                    obligation.id
                                }
                            >
                                {
                                    obligation.name
                                }
                                {" | ₱"}
                                {
                                    obligation.amount
                                }
                                {" | "}

                                {
                                    daysUntilDue === 0
                                        ? "Due Today"
                                        : `Due in ${daysUntilDue} days`
                                }
                            </li>
                        );
                    }
                )}

            </ul>

        </div>
    );
}