export function getDaysUntilDue(
    dueDay: number
): number {

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );

    const currentYear =
        today.getFullYear();

    const currentMonth =
        today.getMonth();

    let nextDueDate =
        new Date(
            currentYear,
            currentMonth,
            dueDay
        );
    nextDueDate.setHours(
        0,
        0,
        0,
        0
    );
    if (
        nextDueDate < today
    ) {
        nextDueDate =
            new Date(
                currentYear,
                currentMonth + 1,
                dueDay
            );
    }

    const millisecondsPerDay =
        1000 * 60 * 60 * 24;

    return Math.ceil(
        (
            nextDueDate.getTime() -
            today.getTime()
        ) /
        millisecondsPerDay
    );
}