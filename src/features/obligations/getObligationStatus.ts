export function getObligationStatus(
    daysUntilDue: number
): string {

    if (daysUntilDue < 0) {
        return "Overdue";
    }

    if (daysUntilDue <= 3) {
        return "Due Soon";
    }

    if (daysUntilDue <= 7) {
        return "Prepare Funds";
    }

    return "Upcoming";
}