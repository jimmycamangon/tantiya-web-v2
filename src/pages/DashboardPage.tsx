import DashboardSummary
    from "../features/dashboard/DashboardSummary";
import UpcomingObligations
    from "../features/dashboard/UpcomingObligations";


export default function DashboardPage() {

    return (
        <>
            <DashboardSummary />

            <hr />

            <UpcomingObligations />
        </>
    );
}