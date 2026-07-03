import { useState, type ReactNode } from "react";

import { useLiveQuery } from "dexie-react-hooks";

import { Download, Printer } from "lucide-react";

import { format, startOfMonth } from "date-fns";

import {
    getCategorySpendingReport,
    getMonthlyTrends,
    getAccountSummaryReport,
    getObligationsReport,
} from "../features/reports/report.service";

import { downloadCsv } from "../features/reports/exportCsv";
import { exportPdf } from "../features/reports/exportPdf";

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
    }).format(amount);
}

function formatMonth(month: string) {
    return format(new Date(month + "-01"), "MMM yyyy");
}

const tableClass =
    "w-full border-collapse text-sm";
const thClass =
    "border-b border-stone-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-stone-500";
const thNumClass = thClass + " text-right";
const tdClass =
    "border-b border-stone-100 px-3 py-2 text-stone-700";
const tdNumClass =
    tdClass + " text-right tabular-nums";

function EmptyState({ message }: { message: string }) {
    return (
        <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm text-stone-500">
            {message}
        </div>
    );
}

function ReportCard({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <div className="mb-4">
                <h2 className="text-base font-semibold text-stone-950">
                    {title}
                </h2>
                <p className="text-sm text-stone-500">
                    {subtitle}
                </p>
            </div>
            {children}
        </section>
    );
}

export default function ReportsPage() {

    const today = new Date();

    const [startDate, setStartDate] = useState(
        format(startOfMonth(today), "yyyy-MM-dd")
    );

    const [endDate, setEndDate] = useState(
        format(today, "yyyy-MM-dd")
    );

    const range = { start: startDate, end: endDate };

    const categorySpending =
        useLiveQuery(
            () => getCategorySpendingReport(range),
            [startDate, endDate]
        ) ?? [];

    const monthlyTrends =
        useLiveQuery(
            () => getMonthlyTrends(range),
            [startDate, endDate]
        ) ?? [];

    const accountSummary =
        useLiveQuery(
            () => getAccountSummaryReport(range),
            [startDate, endDate]
        ) ?? [];

    const obligations =
        useLiveQuery(
            () => getObligationsReport(),
            []
        ) ?? [];

    const rangeLabel = `${startDate} to ${endDate}`;

    function buildSections() {
        return [
            {
                title: "Spending by Category",
                subtitle: rangeLabel,
                headers: [
                    "Category",
                    "Amount",
                    "Transactions",
                    "% of Total",
                ],
                rows: categorySpending.map(row => [
                    row.categoryName,
                    row.amount.toFixed(2),
                    row.count,
                    row.percentage.toFixed(1) + "%",
                ]),
            },
            {
                title: "Monthly Trends",
                subtitle: rangeLabel,
                headers: [
                    "Month",
                    "Income",
                    "Expenses",
                    "Net",
                ],
                rows: monthlyTrends.map(row => [
                    formatMonth(row.month),
                    row.income.toFixed(2),
                    row.expense.toFixed(2),
                    row.net.toFixed(2),
                ]),
            },
            {
                title: "Account Summary",
                subtitle: rangeLabel,
                headers: [
                    "Account",
                    "Income",
                    "Expenses",
                    "Transfers In",
                    "Transfers Out",
                    "Net Change",
                    "Current Balance",
                ],
                rows: accountSummary.map(row => [
                    row.accountName,
                    row.income.toFixed(2),
                    row.expense.toFixed(2),
                    row.transfersIn.toFixed(2),
                    row.transfersOut.toFixed(2),
                    row.netChange.toFixed(2),
                    row.currentBalance.toFixed(2),
                ]),
            },
            {
                title: "Active Obligations",
                subtitle: "As of today",
                headers: [
                    "Obligation",
                    "Account",
                    "Amount",
                    "Recurrence",
                    "Due Day",
                    "Days Until Due",
                    "Status",
                ],
                rows: obligations.map(row => [
                    row.name,
                    row.accountName,
                    row.amount.toFixed(2),
                    row.recurrenceType,
                    row.dueDay,
                    row.daysUntilDue,
                    row.status,
                ]),
            },
        ];
    }

    function handleExportCsv() {
        downloadCsv(
            `tantiya-report-${startDate}-to-${endDate}.csv`,
            buildSections()
        );
    }

    function handleExportPdf() {
        exportPdf(
            "Tantiya Financial Report",
            `Period: ${rangeLabel} · Generated ${format(new Date(), "MMM d, yyyy")}`,
            buildSections()
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-emerald-700">
                    Insights
                </p>
                <h1 className="text-2xl font-semibold text-stone-950 sm:text-3xl">
                    Reports
                </h1>
                <p className="max-w-2xl text-sm text-stone-500">
                    Review spending, trends, and account activity, then export
                    to CSV or PDF.
                </p>
            </div>

            <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <label className="flex flex-col gap-1 text-sm">
                            <span className="font-medium text-stone-700">
                                From
                            </span>
                            <input
                                type="date"
                                value={startDate}
                                max={endDate}
                                onChange={e =>
                                    setStartDate(e.target.value)
                                }
                                className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-950 focus:border-emerald-600 focus:outline-none"
                            />
                        </label>

                        <label className="flex flex-col gap-1 text-sm">
                            <span className="font-medium text-stone-700">
                                To
                            </span>
                            <input
                                type="date"
                                value={endDate}
                                min={startDate}
                                onChange={e =>
                                    setEndDate(e.target.value)
                                }
                                className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-950 focus:border-emerald-600 focus:outline-none"
                            />
                        </label>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleExportCsv}
                            className="flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
                        >
                            <Download
                                aria-hidden="true"
                                className="h-4 w-4"
                            />
                            Export CSV
                        </button>

                        <button
                            type="button"
                            onClick={handleExportPdf}
                            className="flex items-center gap-2 rounded-md bg-stone-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
                        >
                            <Printer
                                aria-hidden="true"
                                className="h-4 w-4"
                            />
                            Export PDF
                        </button>
                    </div>
                </div>
            </section>

            <ReportCard
                title="Spending by Category"
                subtitle={`Expense breakdown, ${rangeLabel}`}
            >
                {categorySpending.length === 0 ? (
                    <EmptyState message="No expenses in this period." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className={tableClass}>
                            <thead>
                                <tr>
                                    <th className={thClass}>Category</th>
                                    <th className={thNumClass}>Amount</th>
                                    <th className={thNumClass}>Transactions</th>
                                    <th className={thNumClass}>% of Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categorySpending.map(row => (
                                    <tr key={row.categoryName}>
                                        <td className={tdClass + " font-medium text-stone-950"}>
                                            {row.categoryName}
                                        </td>
                                        <td className={tdNumClass}>
                                            {formatCurrency(row.amount)}
                                        </td>
                                        <td className={tdNumClass}>
                                            {row.count}
                                        </td>
                                        <td className={tdNumClass}>
                                            {row.percentage.toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </ReportCard>

            <ReportCard
                title="Monthly Trends"
                subtitle={`Income vs expenses, ${rangeLabel}`}
            >
                {monthlyTrends.length === 0 ? (
                    <EmptyState message="No activity in this period." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className={tableClass}>
                            <thead>
                                <tr>
                                    <th className={thClass}>Month</th>
                                    <th className={thNumClass}>Income</th>
                                    <th className={thNumClass}>Expenses</th>
                                    <th className={thNumClass}>Net</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlyTrends.map(row => (
                                    <tr key={row.month}>
                                        <td className={tdClass + " font-medium text-stone-950"}>
                                            {formatMonth(row.month)}
                                        </td>
                                        <td className={tdNumClass}>
                                            {formatCurrency(row.income)}
                                        </td>
                                        <td className={tdNumClass}>
                                            {formatCurrency(row.expense)}
                                        </td>
                                        <td
                                            className={
                                                tdNumClass +
                                                " font-semibold " +
                                                (row.net >= 0
                                                    ? "text-emerald-700"
                                                    : "text-red-600")
                                            }
                                        >
                                            {formatCurrency(row.net)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </ReportCard>

            <ReportCard
                title="Account Summary"
                subtitle={`Activity per account, ${rangeLabel}`}
            >
                {accountSummary.length === 0 ? (
                    <EmptyState message="No accounts yet." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className={tableClass}>
                            <thead>
                                <tr>
                                    <th className={thClass}>Account</th>
                                    <th className={thNumClass}>Income</th>
                                    <th className={thNumClass}>Expenses</th>
                                    <th className={thNumClass}>Transfers In</th>
                                    <th className={thNumClass}>Transfers Out</th>
                                    <th className={thNumClass}>Net Change</th>
                                    <th className={thNumClass}>Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accountSummary.map(row => (
                                    <tr key={row.accountName}>
                                        <td className={tdClass + " font-medium text-stone-950"}>
                                            {row.accountName}
                                        </td>
                                        <td className={tdNumClass}>
                                            {formatCurrency(row.income)}
                                        </td>
                                        <td className={tdNumClass}>
                                            {formatCurrency(row.expense)}
                                        </td>
                                        <td className={tdNumClass}>
                                            {formatCurrency(row.transfersIn)}
                                        </td>
                                        <td className={tdNumClass}>
                                            {formatCurrency(row.transfersOut)}
                                        </td>
                                        <td
                                            className={
                                                tdNumClass +
                                                " font-semibold " +
                                                (row.netChange >= 0
                                                    ? "text-emerald-700"
                                                    : "text-red-600")
                                            }
                                        >
                                            {formatCurrency(row.netChange)}
                                        </td>
                                        <td className={tdNumClass + " font-semibold"}>
                                            {formatCurrency(row.currentBalance)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </ReportCard>

            <ReportCard
                title="Active Obligations"
                subtitle="Current status of recurring obligations"
            >
                {obligations.length === 0 ? (
                    <EmptyState message="No active obligations." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className={tableClass}>
                            <thead>
                                <tr>
                                    <th className={thClass}>Obligation</th>
                                    <th className={thClass}>Account</th>
                                    <th className={thNumClass}>Amount</th>
                                    <th className={thClass}>Recurrence</th>
                                    <th className={thNumClass}>Due Day</th>
                                    <th className={thNumClass}>Days Left</th>
                                    <th className={thClass}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {obligations.map(row => (
                                    <tr key={row.name + row.accountName}>
                                        <td className={tdClass + " font-medium text-stone-950"}>
                                            {row.name}
                                        </td>
                                        <td className={tdClass}>
                                            {row.accountName}
                                        </td>
                                        <td className={tdNumClass}>
                                            {formatCurrency(row.amount)}
                                        </td>
                                        <td className={tdClass}>
                                            {row.recurrenceType.replace("_", " ")}
                                        </td>
                                        <td className={tdNumClass}>
                                            {row.dueDay}
                                        </td>
                                        <td className={tdNumClass}>
                                            {row.daysUntilDue}
                                        </td>
                                        <td className={tdClass}>
                                            <span
                                                className={
                                                    "rounded-full px-2 py-0.5 text-xs font-medium " +
                                                    (row.status === "Overdue"
                                                        ? "bg-red-50 text-red-700"
                                                        : row.status === "Due Soon"
                                                          ? "bg-amber-50 text-amber-700"
                                                          : row.status === "Prepare Funds"
                                                            ? "bg-orange-50 text-orange-700"
                                                            : "bg-emerald-50 text-emerald-700")
                                                }
                                            >
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </ReportCard>
        </div>
    );
}
