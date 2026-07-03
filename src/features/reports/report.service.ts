import { db } from "../../db/database";

import { calculateAccountBalance } from "../accounts/accountBalance.service";
import { getObligationDueInfo } from "../obligations/obligationSchedule";
import { getObligationStatus } from "../obligations/getObligationStatus";
import { getPaidPeriodKeys } from "../obligations/obligationPayment.service";

export interface DateRange {
    start: string; // yyyy-MM-dd (inclusive)
    end: string; // yyyy-MM-dd (inclusive)
}

function isWithinRange(
    dateString: string,
    range: DateRange
): boolean {
    const date = dateString.slice(0, 10);

    return date >= range.start && date <= range.end;
}

export interface CategorySpendingRow {
    categoryName: string;
    amount: number;
    count: number;
    percentage: number;
}

export async function getCategorySpendingReport(
    range: DateRange
): Promise<CategorySpendingRow[]> {

    const expenses = await db.expenses
        .filter(
            expense =>
                !expense.isDeleted &&
                isWithinRange(expense.date, range)
        )
        .toArray();

    const categories = await db.categories.toArray();

    const totals = new Map<string, { amount: number; count: number }>();

    for (const expense of expenses) {
        const current =
            totals.get(expense.categoryId) ??
            { amount: 0, count: 0 };

        totals.set(expense.categoryId, {
            amount: current.amount + expense.amount,
            count: current.count + 1,
        });
    }

    const grandTotal = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
    );

    return Array.from(totals.entries())
        .map(([categoryId, { amount, count }]) => {
            const category = categories.find(
                c => c.id === categoryId
            );

            return {
                categoryName: category?.name ?? "Unknown",
                amount,
                count,
                percentage:
                    grandTotal > 0
                        ? (amount / grandTotal) * 100
                        : 0,
            };
        })
        .sort((a, b) => b.amount - a.amount);
}

export interface MonthlyTrendRow {
    month: string; // yyyy-MM
    income: number;
    expense: number;
    net: number;
}

export async function getMonthlyTrends(
    range: DateRange
): Promise<MonthlyTrendRow[]> {

    const incomes = await db.incomes
        .filter(
            income =>
                !income.isDeleted &&
                isWithinRange(income.date, range)
        )
        .toArray();

    const expenses = await db.expenses
        .filter(
            expense =>
                !expense.isDeleted &&
                isWithinRange(expense.date, range)
        )
        .toArray();

    const months = new Map<string, { income: number; expense: number }>();

    const getEntry = (dateString: string) => {
        const month = dateString.slice(0, 7);

        let entry = months.get(month);

        if (!entry) {
            entry = { income: 0, expense: 0 };
            months.set(month, entry);
        }

        return entry;
    };

    for (const income of incomes) {
        getEntry(income.date).income += income.amount;
    }

    for (const expense of expenses) {
        getEntry(expense.date).expense += expense.amount;
    }

    return Array.from(months.entries())
        .map(([month, { income, expense }]) => ({
            month,
            income,
            expense,
            net: income - expense,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));
}

export interface AccountSummaryRow {
    accountName: string;
    income: number;
    expense: number;
    transfersIn: number;
    transfersOut: number;
    netChange: number;
    currentBalance: number;
}

export async function getAccountSummaryReport(
    range: DateRange
): Promise<AccountSummaryRow[]> {

    const accounts = await db.accounts
        .filter(account => !account.archived)
        .toArray();

    const incomes = await db.incomes
        .filter(
            income =>
                !income.isDeleted &&
                isWithinRange(income.date, range)
        )
        .toArray();

    const expenses = await db.expenses
        .filter(
            expense =>
                !expense.isDeleted &&
                isWithinRange(expense.date, range)
        )
        .toArray();

    const transfers = await db.transfers
        .filter(
            transfer =>
                !transfer.isDeleted &&
                isWithinRange(transfer.date, range)
        )
        .toArray();

    const rows: AccountSummaryRow[] = [];

    for (const account of accounts) {

        const income = incomes
            .filter(i => i.accountId === account.id)
            .reduce((sum, i) => sum + i.amount, 0);

        const expense = expenses
            .filter(e => e.accountId === account.id)
            .reduce((sum, e) => sum + e.amount, 0);

        const transfersIn = transfers
            .filter(t => t.toAccountId === account.id)
            .reduce((sum, t) => sum + t.amount, 0);

        const transfersOut = transfers
            .filter(t => t.fromAccountId === account.id)
            .reduce((sum, t) => sum + t.amount, 0);

        const currentBalance =
            await calculateAccountBalance(account.id);

        rows.push({
            accountName: account.name,
            income,
            expense,
            transfersIn,
            transfersOut,
            netChange:
                income - expense + transfersIn - transfersOut,
            currentBalance,
        });
    }

    return rows.sort((a, b) =>
        a.accountName.localeCompare(b.accountName)
    );
}

export interface ObligationReportRow {
    name: string;
    accountName: string;
    amount: number;
    recurrenceType: string;
    dueDay: number;
    daysUntilDue: number;
    status: string;
}

export async function getObligationsReport(): Promise<
    ObligationReportRow[]
> {

    const obligations = await db.obligations
        .filter(obligation => obligation.active)
        .toArray();

    const accounts = await db.accounts.toArray();

    const paidPeriodKeys = await getPaidPeriodKeys();

    return obligations
        .map(obligation => {
            const account = accounts.find(
                a => a.id === obligation.accountId
            );

            const dueInfo = getObligationDueInfo(
                obligation,
                paidPeriodKeys.get(obligation.id) ??
                    new Set()
            );

            return {
                name: obligation.name,
                accountName: account?.name ?? "Unknown",
                amount: obligation.amount,
                recurrenceType: obligation.recurrenceType,
                dueDay: obligation.dueDay,
                daysUntilDue: dueInfo.daysUntilDue,
                status: dueInfo.paidForCurrentPeriod
                    ? "Paid"
                    : getObligationStatus(
                          dueInfo.daysUntilDue
                      ),
            };
        })
        .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
}
