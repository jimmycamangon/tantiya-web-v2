import DashboardSummary
    from "../features/dashboard/DashboardSummary";
import UpcomingObligations
    from "../features/dashboard/UpcomingObligations";

import TopSpendingCategories
    from "../features/dashboard/TopSpendingCategories";

import MonthlySummary
    from "../features/dashboard/MonthlySummary";

import RecentActivity
    from "../features/dashboard/RecentActivity";

export default function DashboardPage() {

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-emerald-700">
                    Overview
                </p>
                <h1 className="text-2xl font-semibold text-stone-950 sm:text-3xl">
                    Dashboard
                </h1>
                <p className="max-w-2xl text-sm text-stone-500">
                    Track cash, obligations, and recent movement in one practical view.
                </p>
            </div>

            <DashboardSummary />

            <MonthlySummary />

            <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
                <UpcomingObligations />

                <TopSpendingCategories />
            </div>

            <RecentActivity />
        </div>
    );
}
