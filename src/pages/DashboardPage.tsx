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
        <>
            <DashboardSummary />
            <hr />
            <MonthlySummary />
            <hr />

            <UpcomingObligations />

            <TopSpendingCategories />

            <RecentActivity />
        </>
    );
}