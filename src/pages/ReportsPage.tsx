import { useState, type ReactNode } from "react";

import { useLiveQuery } from "dexie-react-hooks";

import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    CheckCircle2,
    Download,
    Info,
    Printer,
} from "lucide-react";

import {
    addDays,
    endOfMonth,
    format,
    parseISO,
    startOfMonth,
    startOfYear,
    subMonths,
} from "date-fns";

import {
    getCategorySpendingReport,
    getMonthlyTrends,
    getAccountSummaryReport,
    getObligationsReport,
} from "../features/reports/report.service";

import {
    getReportAnalytics,
    type Insight,
} from "../features/reports/analytics.service";

import {
    CategoryBars,
    ColumnChart,
    PaceChart,
} from "../features/reports/charts";

import { COLORS } from "../features/reports/chartTheme";

import { getCurrentCutoff } from "../features/cutoffs/getCurrentCutoff";

import { downloadCsv } from "../features/reports/exportCsv";
import { exportPdf } from "../features/reports/exportPdf";

type PresetId =
    | "this_month"
    | "last_month"
    | "this_cutoff"
    | "last_cutoff"
    | "last_3_months"
    | "this_year";

const PRESETS: { id: PresetId; label: string }[] = [
    { id: "this_month", label: "This month" },
    { id: "last_month", label: "Last month" },
    { id: "this_cutoff", label: "This cutoff" },
    { id: "last_cutoff", label: "Last cutoff" },
    { id: "last_3_months", label: "Last 3 months" },
    { id: "this_year", label: "This year" },
];

function presetRange(id: PresetId, today: Date) {
    const key = (d: Date) => format(d, "yyyy-MM-dd");

    switch (id) {
        case "last_month": {
            const start = startOfMonth(subMonths(today, 1));
            return { start: key(start), end: key(endOfMonth(start)) };
        }
        case "this_cutoff": {
            const cutoff = getCurrentCutoff(today);
            return { start: key(cutoff.startDate), end: key(today) };
        }
        case "last_cutoff": {
            const current = getCurrentCutoff(today);
            const previous = getCurrentCutoff(addDays(current.startDate, -1));
            return { start: key(previous.startDate), end: key(previous.endDate) };
        }
        case "last_3_months":
            return { start: key(startOfMonth(subMonths(today, 2))), end: key(today) };
        case "this_year":
            return { start: key(startOfYear(today)), end: key(today) };
        default:
            return { start: key(startOfMonth(today)), end: key(today) };
    }
}

function formatShortRange(start: string, end: string) {
    return `${format(parseISO(start), "MMM d")}–${format(parseISO(end), "MMM d")}`;
}

function percentChange(current: number, previous: number): number | null {
    if (previous === 0) {
        return null;
    }

    return (current - previous) / Math.abs(previous);
}

function StatTile({
    label,
    value,
    change,
    upIsGood,
    note,
    emptyNote,
}: {
    label: string;
    value: string;
    change: number | null;
    upIsGood: boolean;
    note: string;
    /** Shown instead of the comparison when there is nothing to compare. */
    emptyNote?: string;
}) {
    const hasChange = change !== null && Number.isFinite(change) && Math.abs(change) >= 0.005;
    const up = (change ?? 0) > 0;
    const good = up === upIsGood;

    return (
        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-stone-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-stone-950">{value}</p>
            <p className="mt-1 flex items-center gap-1 text-xs">
                {emptyNote ? (
                    <span className="text-stone-500">{emptyNote}</span>
                ) : hasChange ? (
                    <>
                        <span
                            className={`inline-flex items-center gap-0.5 font-semibold ${good ? "text-emerald-700" : "text-red-600"}`}
                        >
                            {up
                                ? <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                                : <ArrowDownRight aria-hidden="true" className="h-3.5 w-3.5" />}
                            {up ? "+" : "−"}{Math.round(Math.abs(change as number) * 100)}%
                        </span>
                        <span className="text-stone-500">{note}</span>
                    </>
                ) : (
                    <span className="text-stone-500">No change {note}</span>
                )}
            </p>
        </section>
    );
}

const INSIGHT_STYLES: Record<Insight["tone"], { icon: typeof Info; className: string; label: string }> = {
    good: { icon: CheckCircle2, className: "text-emerald-700", label: "Good" },
    warn: { icon: AlertTriangle, className: "text-amber-700", label: "Watch" },
    info: { icon: Info, className: "text-stone-500", label: "Note" },
};

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
        <section className="min-w-0 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
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

    const [today] = useState(() => new Date());

    const [preset, setPreset] = useState<PresetId | null>("this_month");

    const [startDate, setStartDate] = useState(
        format(startOfMonth(today), "yyyy-MM-dd")
    );

    const [endDate, setEndDate] = useState(
        format(today, "yyyy-MM-dd")
    );

    const range = { start: startDate, end: endDate };

    function applyPreset(id: PresetId) {
        const next = presetRange(id, today);
        setPreset(id);
        setStartDate(next.start);
        setEndDate(next.end);
    }

    const analytics =
        useLiveQuery(
            () => getReportAnalytics(range),
            [startDate, endDate]
        );

    const prevLabel = analytics
        ? formatShortRange(analytics.previous.start, analytics.previous.end)
        : "previous period";

    const vsNote = `vs ${prevLabel}`;

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
        const summary = analytics
            ? [
                {
                    title: "Summary",
                    subtitle: `${rangeLabel} (compared with ${prevLabel})`,
                    headers: ["Measure", "This period", "Previous period"],
                    rows: [
                        ["Income", analytics.kpis.income.toFixed(2), analytics.prevKpis.income.toFixed(2)],
                        ["Expenses", analytics.kpis.expense.toFixed(2), analytics.prevKpis.expense.toFixed(2)],
                        ["Net saved", analytics.kpis.net.toFixed(2), analytics.prevKpis.net.toFixed(2)],
                        [
                            "Savings rate",
                            analytics.kpis.savingsRate === null ? "-" : `${Math.round(analytics.kpis.savingsRate * 100)}%`,
                            analytics.prevKpis.savingsRate === null ? "-" : `${Math.round(analytics.prevKpis.savingsRate * 100)}%`,
                        ],
                        ["Average daily spend", analytics.kpis.avgDailySpend.toFixed(2), analytics.prevKpis.avgDailySpend.toFixed(2)],
                    ],
                },
                {
                    title: "Insights",
                    subtitle: rangeLabel,
                    headers: ["Insight", "Details"],
                    rows: analytics.insights.map(insight => [insight.title, insight.detail]),
                },
            ]
            : [];

        return [
            ...summary,
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
                <div
                    role="group"
                    aria-label="Report period"
                    className="mb-4 flex flex-wrap gap-2"
                >
                    {PRESETS.map(item => (
                        <button
                            key={item.id}
                            type="button"
                            aria-pressed={preset === item.id}
                            onClick={() => applyPreset(item.id)}
                            className={preset === item.id
                                ? "rounded-full bg-stone-950 px-3 py-1.5 text-sm font-medium text-white"
                                : "rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100"}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

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
                                onChange={e => {
                                    setPreset(null);
                                    setStartDate(e.target.value);
                                }}
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
                                onChange={e => {
                                    setPreset(null);
                                    setEndDate(e.target.value);
                                }}
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

            {analytics && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <StatTile
                        label="Income"
                        value={formatCurrency(analytics.kpis.income)}
                        change={percentChange(analytics.kpis.income, analytics.prevKpis.income)}
                        upIsGood
                        note={vsNote}
                    />
                    <StatTile
                        label="Expenses"
                        value={formatCurrency(analytics.kpis.expense)}
                        change={percentChange(analytics.kpis.expense, analytics.prevKpis.expense)}
                        upIsGood={false}
                        note={vsNote}
                    />
                    <StatTile
                        label="Net saved"
                        value={formatCurrency(analytics.kpis.net)}
                        change={percentChange(analytics.kpis.net, analytics.prevKpis.net)}
                        upIsGood
                        note={vsNote}
                    />
                    <StatTile
                        label="Savings rate"
                        value={analytics.kpis.savingsRate === null
                            ? "—"
                            : `${Math.round(analytics.kpis.savingsRate * 100)}%`}
                        change={analytics.kpis.savingsRate !== null && analytics.prevKpis.savingsRate !== null
                            ? analytics.kpis.savingsRate - analytics.prevKpis.savingsRate
                            : null}
                        upIsGood
                        note={`pts ${vsNote}`}
                        emptyNote={analytics.kpis.savingsRate === null
                            ? "No income recorded"
                            : undefined}
                    />
                    <StatTile
                        label="Avg daily spend"
                        value={formatCurrency(analytics.kpis.avgDailySpend)}
                        change={percentChange(analytics.kpis.avgDailySpend, analytics.prevKpis.avgDailySpend)}
                        upIsGood={false}
                        note={vsNote}
                    />
                </div>
            )}

            {analytics && (
                <ReportCard
                    title="Insights"
                    subtitle={`What stands out in ${rangeLabel}, compared with ${prevLabel}`}
                >
                    {analytics.insights.length === 0 ? (
                        <EmptyState message="Not enough activity yet. Insights appear once you have expenses in this period." />
                    ) : (
                        <ul className="grid gap-3 md:grid-cols-2" data-testid="report-insights">
                            {analytics.insights.map(insight => {
                                const style = INSIGHT_STYLES[insight.tone];
                                const Icon = style.icon;

                                return (
                                    <li
                                        key={insight.title}
                                        className="flex gap-3 rounded-md border border-stone-200 p-3"
                                    >
                                        <Icon
                                            aria-label={style.label}
                                            className={`mt-0.5 h-5 w-5 shrink-0 ${style.className}`}
                                        />
                                        <div>
                                            <p className="text-sm font-semibold text-stone-950">
                                                {insight.title}
                                            </p>
                                            <p className="text-sm text-stone-600">
                                                {insight.detail}
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </ReportCard>
            )}

            {analytics && analytics.pace.length > 1 && (
                <ReportCard
                    title="Spending Pace"
                    subtitle="Running total of expenses, day by day, against the previous period"
                >
                    <PaceChart
                        points={analytics.pace}
                        currentLabel={`This period (${formatShortRange(startDate, endDate)})`}
                        previousLabel={`Previous (${prevLabel})`}
                    />
                </ReportCard>
            )}

            <ReportCard
                title="Spending by Category"
                subtitle={`Expense breakdown, ${rangeLabel}`}
            >
                {categorySpending.length === 0 ? (
                    <EmptyState message="No expenses in this period." />
                ) : (
                    <>
                    {analytics && (
                        <CategoryBars
                            rows={analytics.categories.filter(row => row.amount > 0).slice(0, 10)}
                        />
                    )}
                    <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium text-stone-600">
                        View as table
                    </summary>
                    <div className="mt-2 overflow-x-auto">
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
                    </details>
                    </>
                )}
            </ReportCard>

            {analytics && (
                <div className="grid gap-4 xl:grid-cols-2">
                    <ReportCard
                        title="Income vs Expenses"
                        subtitle={`Last 6 months to ${format(parseISO(endDate), "MMM yyyy")}`}
                    >
                        <ColumnChart
                            title="Income and expenses per month"
                            data={analytics.months.map(m => ({ ...m, label: format(parseISO(m.month + "-01"), "MMM") }))}
                            series={[
                                { key: "income", label: "Income", color: COLORS.series1 },
                                { key: "expense", label: "Expenses", color: COLORS.series2 },
                            ]}
                            value={(d, key) => key === "income" ? d.income : d.expense}
                            tooltipExtra={d => [{ label: "net", value: formatCurrency(d.income - d.expense) }]}
                        />
                    </ReportCard>

                    <ReportCard
                        title="Spending by Day of Week"
                        subtitle={`Total expenses per weekday, ${rangeLabel}`}
                    >
                        <ColumnChart
                            title="Expenses per weekday"
                            data={analytics.weekdays}
                            series={[{ key: "amount", label: "Expenses", color: COLORS.series1 }]}
                            value={d => d.amount}
                            tooltipExtra={d => [{ label: "expenses", value: String(d.count) }]}
                            highlightMax
                        />
                    </ReportCard>
                </div>
            )}

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
