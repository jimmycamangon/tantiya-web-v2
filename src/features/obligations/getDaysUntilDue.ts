export function getDaysUntilDue(
    dueDay: number
): number {

    const today = new Date();

    const currentDay =
        today.getDate();

    if (dueDay >= currentDay) {
        return dueDay - currentDay;
    }

    return (
        (30 - currentDay) +
        dueDay
    );
}