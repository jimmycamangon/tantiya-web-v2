import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
    AlertTriangle,
    CalendarCheck,
    CheckCircle2,
    Download,
    FileChartColumn,
    Fuel,
    PiggyBank,
    Receipt,
    Smartphone,
    TrendingUp,
    Wallet,
} from "lucide-react";

const SECTIONS = [
    { id: "basics", label: "The big idea" },
    { id: "setup", label: "Set up in 5 steps" },
    { id: "cutoffs", label: "Cutoffs" },
    { id: "bills", label: "Bills" },
    { id: "budgets", label: "Spending budgets" },
    { id: "routine", label: "Everyday use" },
    { id: "example", label: "Example" },
    { id: "reports", label: "Reports" },
    { id: "offline", label: "Offline & backup" },
    { id: "faq", label: "FAQ" },
];

function Section({
    id,
    title,
    intro,
    children,
}: {
    id: string;
    title: string;
    intro?: string;
    children: ReactNode;
}) {
    return (
        <section
            id={id}
            className="scroll-mt-24 rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
        >
            <h2 className="text-xl font-semibold text-stone-950">{title}</h2>
            {intro && <p className="mt-1 text-stone-600">{intro}</p>}
            <div className="mt-4 space-y-4 text-stone-700">{children}</div>
        </section>
    );
}

function PageLink({ to, children }: { to: string; children: ReactNode }) {
    return (
        <Link to={to} className="font-medium text-emerald-700 underline-offset-2 hover:underline">
            {children}
        </Link>
    );
}

function Tip({ children }: { children: ReactNode }) {
    return (
        <div className="flex gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <div>{children}</div>
        </div>
    );
}

function Heads({ children }: { children: ReactNode }) {
    return (
        <div className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <div>{children}</div>
        </div>
    );
}

const tableClass = "w-full border-collapse text-sm";
const th = "border-b border-stone-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-stone-500";
const td = "border-b border-stone-100 px-3 py-2 align-top";

export default function GuidePage() {

    return (
        <div className="mx-auto max-w-4xl space-y-6">

            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-emerald-700">Help</p>
                <h1 className="text-2xl font-semibold text-stone-950 sm:text-3xl">
                    How to use Tantiya
                </h1>
                <p className="max-w-2xl text-sm text-stone-500">
                    Tantiya tells you how much money you can actually spend,
                    after setting aside what you need for bills and regular costs.
                    Everything stays on your device.
                </p>
            </div>

            <nav
                aria-label="Guide sections"
                className="flex flex-wrap gap-2"
            >
                {SECTIONS.map(section => (
                    <a
                        key={section.id}
                        href={`#${section.id}`}
                        className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
                    >
                        {section.label}
                    </a>
                ))}
            </nav>

            <Section
                id="basics"
                title="The big idea"
                intro="Your dashboard shows three numbers. The one that matters most is Safe To Spend."
            >
                <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
                    <div className="rounded-md border border-stone-200 p-3">
                        <p className="text-xs font-medium text-stone-500">Actual Balance</p>
                        <p className="text-lg font-semibold text-stone-950">₱20,000</p>
                        <p className="text-xs text-stone-500">All the money in your accounts</p>
                    </div>
                    <p className="text-center text-xl font-semibold text-stone-400" aria-hidden="true">−</p>
                    <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                        <p className="text-xs font-medium text-amber-800">Reserved</p>
                        <p className="text-lg font-semibold text-amber-900">₱9,500</p>
                        <p className="text-xs text-amber-800">Set aside for bills and budgets</p>
                    </div>
                    <p className="text-center text-xl font-semibold text-stone-400" aria-hidden="true">=</p>
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
                        <p className="text-xs font-medium text-emerald-800">Safe To Spend</p>
                        <p className="text-lg font-semibold text-emerald-900">₱10,500</p>
                        <p className="text-xs text-emerald-800">What you can freely use</p>
                    </div>
                </div>

                <p>
                    The money is still in your accounts. Tantiya just marks part of it
                    as &ldquo;already spoken for&rdquo;, so you don&rsquo;t accidentally
                    spend your rent money on food.
                </p>

                <Tip>
                    If Safe To Spend turns <strong>red</strong>, you have already used
                    money meant for bills. Slow down until your next payday.
                </Tip>
            </Section>

            <Section
                id="setup"
                title="Set up in 5 steps"
                intro="Do this once. It takes about five minutes."
            >
                <ol className="space-y-3">
                    {[
                        {
                            icon: Wallet,
                            title: "Add your accounts",
                            body: (
                                <>
                                    In <PageLink to="/accounts">Accounts</PageLink>, add every place
                                    you keep money (Cash, GCash, Maya, BPI…) with how much is in it
                                    today as the Opening Balance. Add a <strong>Savings</strong> account too.
                                </>
                            ),
                        },
                        {
                            icon: Receipt,
                            title: "Check your categories",
                            body: (
                                <>
                                    <PageLink to="/categories">Categories</PageLink> describe what you
                                    spend on (Food, Bills, Transportation…). Add any you need, like
                                    &ldquo;Gas&rdquo; or &ldquo;Groceries&rdquo;.
                                </>
                            ),
                        },
                        {
                            icon: CalendarCheck,
                            title: "Add your bills",
                            body: (
                                <>
                                    In <PageLink to="/obligations">Obligations</PageLink>, add bills with a
                                    fixed due date: rent, Meralco, internet, credit card. Watch the
                                    preview: it shows your Safe To Spend after saving.
                                </>
                            ),
                        },
                        {
                            icon: Fuel,
                            title: "Add spending budgets",
                            body: (
                                <>
                                    On the same page, under <strong>Spending Budgets</strong>, add
                                    regular costs with no due date: gas, groceries, load.
                                </>
                            ),
                        },
                        {
                            icon: TrendingUp,
                            title: "Record your pay when it arrives",
                            body: (
                                <>
                                    Add each payday in <PageLink to="/incomes">Incomes</PageLink>.
                                    From then on, record expenses as you go.
                                </>
                            ),
                        },
                    ].map((step, index) => {
                        const Icon = step.icon;

                        return (
                            <li key={step.title} className="flex gap-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-950 text-sm font-semibold text-white">
                                    {index + 1}
                                </span>
                                <div>
                                    <p className="flex items-center gap-1.5 font-semibold text-stone-950">
                                        <Icon aria-hidden="true" className="h-4 w-4 text-stone-500" />
                                        {step.title}
                                    </p>
                                    <p className="text-sm text-stone-600">{step.body}</p>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            </Section>

            <Section
                id="cutoffs"
                title="Cutoffs: your two paydays"
                intro="Tantiya splits every month into two halves, like a kinsenas-katapusan payroll."
            >
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-md border border-stone-200 p-3">
                        <p className="font-semibold text-stone-950">1st cutoff</p>
                        <p className="text-sm text-stone-600">The 1st to the 15th</p>
                    </div>
                    <div className="rounded-md border border-stone-200 p-3">
                        <p className="font-semibold text-stone-950">2nd cutoff</p>
                        <p className="text-sm text-stone-600">The 16th to the end of the month</p>
                    </div>
                </div>
                <p>
                    Bills and budgets use cutoffs to decide <em>which paycheck</em> pays
                    for them, so money is set aside at the right time.
                </p>
            </Section>

            <Section
                id="bills"
                title="Bills (Obligations)"
                intro="For anything with a due date and a fixed amount."
            >
                <p>
                    The moment you save a bill, its amount is reserved, based on the
                    <strong> Funding Rule</strong> you pick:
                </p>

                <div className="overflow-x-auto">
                    <table className={tableClass}>
                        <thead>
                            <tr>
                                <th className={th}>Funding Rule</th>
                                <th className={th}>When money is set aside</th>
                                <th className={th}>Good for</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className={td + " font-medium"}>Current Cutoff</td>
                                <td className={td}>During the cutoff the bill is due in</td>
                                <td className={td}>Bills due late in a cutoff (25th–30th, 10th–15th)</td>
                            </tr>
                            <tr>
                                <td className={td + " font-medium"}>Previous Cutoff</td>
                                <td className={td}>One cutoff earlier, so it&rsquo;s ready before the due date</td>
                                <td className={td}>Bills due early in a cutoff (1st–5th, 16th–20th)</td>
                            </tr>
                            <tr>
                                <td className={td + " font-medium"}>Split Cutoffs</td>
                                <td className={td}>Half in each of the two cutoffs before it&rsquo;s due</td>
                                <td className={td}>Big bills: credit card, loan, rent</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <p>
                    <strong>When you pay a bill</strong>, press <strong>Mark paid</strong> and keep
                    &ldquo;Also record as an expense&rdquo; checked. The money moves from
                    &ldquo;reserved&rdquo; to &ldquo;spent&rdquo;, so it is never counted twice.
                </p>

                <Heads>
                    A bill whose due date passed without being marked paid shows as
                    <strong> overdue</strong> and stays fully reserved. If you already paid it,
                    just mark it paid.
                </Heads>
            </Section>

            <Section
                id="budgets"
                title="Spending budgets"
                intro="For regular costs with no due date, like gas, groceries, or load."
            >
                <p>
                    Set a monthly amount and a category. Money is set aside while the budget
                    is active. Every expense in that category uses it up, and it
                    <strong> doesn&rsquo;t lower Safe To Spend again</strong>, because the money was
                    already set aside.
                </p>

                <div className="overflow-x-auto">
                    <table className={tableClass}>
                        <thead>
                            <tr>
                                <th className={th}>&ldquo;When you spend it&rdquo;</th>
                                <th className={th}>Active</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td className={td + " font-medium"}>1st cutoff only</td><td className={td}>1st–15th; any leftover is settled on the 16th</td></tr>
                            <tr><td className={td + " font-medium"}>2nd cutoff only</td><td className={td}>16th–end of month</td></tr>
                            <tr><td className={td + " font-medium"}>Every cutoff</td><td className={td}>Half the amount in each cutoff</td></tr>
                            <tr><td className={td + " font-medium"}>Whole month</td><td className={td}>The full month</td></tr>
                        </tbody>
                    </table>
                </div>

                <div className="flex gap-3 rounded-md border border-stone-200 p-3">
                    <PiggyBank aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                    <div className="text-sm">
                        <p className="font-semibold text-stone-950">What happens to leftovers?</p>
                        <p className="text-stone-600">
                            When a budget period ends, a card appears on the Dashboard, for example
                            &ldquo;Spent ₱1,230 of ₱1,500 · ₱270 left&rdquo;. Choose:
                        </p>
                        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-stone-600">
                            <li><strong>Move to savings</strong> (default): transfers it to your Savings account.</li>
                            <li><strong>Roll over</strong>: adds it to next period&rsquo;s budget (up to one period&rsquo;s worth).</li>
                            <li><strong>Release</strong>: puts it back into Safe To Spend.</li>
                        </ul>
                    </div>
                </div>

                <Tip>
                    <strong>Bill or budget?</strong> If it has a due date and a fixed amount,
                    it&rsquo;s a bill. If you spend it bit by bit whenever needed, it&rsquo;s a budget.
                </Tip>
            </Section>

            <Section id="routine" title="Everyday use">
                <div className="overflow-x-auto">
                    <table className={tableClass}>
                        <thead>
                            <tr>
                                <th className={th}>When…</th>
                                <th className={th}>Do this</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className={td + " font-medium"}>You get paid</td>
                                <td className={td}>Add it in <PageLink to="/incomes">Incomes</PageLink> to the account it landed in.</td>
                            </tr>
                            <tr>
                                <td className={td + " font-medium"}>You spend</td>
                                <td className={td}>
                                    Add it in <PageLink to="/expenses">Expenses</PageLink>. The quick box
                                    understands things like <code className="rounded bg-stone-100 px-1">120 lunch gcash food</code>.
                                </td>
                            </tr>
                            <tr>
                                <td className={td + " font-medium"}>You pay a bill</td>
                                <td className={td}>Press <strong>Mark paid</strong> on it in <PageLink to="/obligations">Obligations</PageLink>.</td>
                            </tr>
                            <tr>
                                <td className={td + " font-medium"}>You move money between accounts</td>
                                <td className={td}>Use <PageLink to="/transfers">Transfers</PageLink>. Your total doesn&rsquo;t change.</td>
                            </tr>
                            <tr>
                                <td className={td + " font-medium"}>An account balance is off</td>
                                <td className={td}>Use <strong>Adjust balance</strong> in <PageLink to="/accounts">Accounts</PageLink> to match the real amount.</td>
                            </tr>
                            <tr>
                                <td className={td + " font-medium"}>A budget period ends</td>
                                <td className={td}>Choose what to do with the leftover on the Dashboard card.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <p className="font-semibold text-stone-950">Two safety checks</p>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                    <li>
                        <strong>Blocked:</strong> an expense larger than the account&rsquo;s balance
                        is not saved (&ldquo;Not enough balance&rdquo;).
                    </li>
                    <li>
                        <strong>Warning:</strong> if an expense would use money set aside for bills or
                        other budgets, Tantiya asks first. You can Cancel or choose <em>Spend anyway</em>.
                    </li>
                </ul>
            </Section>

            <Section
                id="example"
                title="Example: one cutoff"
                intro="You're paid ₱15,000 on the 15th and the 30th. It is November 16."
            >
                <ol className="space-y-3 text-sm">
                    <li>
                        <strong>Nov 16:</strong> BPI has ₱15,000 and GCash ₱2,000. You add Rent
                        ₱8,000 (due 30th, Current Cutoff) and Meralco ₱2,400 (due 5th, Previous Cutoff).
                        Safe To Spend: <strong>₱6,600</strong>.
                    </li>
                    <li>
                        <strong>Nov 18:</strong> Groceries ₱1,200 from BPI. No warning.
                        Safe To Spend: <strong>₱5,400</strong>.
                    </li>
                    <li>
                        <strong>Nov 30:</strong> Pay rent and press Mark paid. Safe To Spend doesn&rsquo;t
                        change: that money was already set aside. Add your ₱15,000 pay in Incomes.
                    </li>
                    <li>
                        <strong>Dec 1:</strong> A new cutoff starts. Bills funded by this cutoff are
                        set aside automatically.
                    </li>
                </ol>
            </Section>

            <Section
                id="reports"
                title="Reports"
                intro="See where your money went and whether you're spending more than before."
            >
                <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                        <FileChartColumn aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-stone-500" />
                        <span>
                            Pick a period (This month, This cutoff, Last 3 months…). Every number is
                            compared with the period before it: green is better, red is worse.
                        </span>
                    </li>
                    <li className="flex gap-2">
                        <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-stone-500" />
                        <span>
                            <strong>Insights</strong> say what stands out in plain words, like
                            &ldquo;Food is up ₱1,200&rdquo; or &ldquo;On pace for about ₱19,000 this month&rdquo;.
                        </span>
                    </li>
                    <li className="flex gap-2">
                        <TrendingUp aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-stone-500" />
                        <span>
                            <strong>Spending Pace</strong> shows your running total against last period.
                            If the blue line is above the gray one, you&rsquo;re spending faster than before.
                        </span>
                    </li>
                    <li className="flex gap-2">
                        <Download aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-stone-500" />
                        <span>Export to CSV or PDF to keep or share a copy.</span>
                    </li>
                </ul>
            </Section>

            <Section
                id="offline"
                title="Offline, install, and backup"
            >
                <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                        <Smartphone aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-stone-500" />
                        <span>
                            <strong>Works offline.</strong> After your first visit, you can add, edit, and
                            delete everything without internet. Nothing waits for a connection.
                        </span>
                    </li>
                    <li className="flex gap-2">
                        <Smartphone aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-stone-500" />
                        <span>
                            <strong>Install it</strong> from your browser menu (&ldquo;Add to Home Screen&rdquo; or
                            &ldquo;Install app&rdquo;). On a phone, the main pages are in the bar at the bottom;
                            the rest are under <strong>More</strong>.
                        </span>
                    </li>
                    <li className="flex gap-2">
                        <Download aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-stone-500" />
                        <span>
                            <strong>Your data stays on this device.</strong> There is no account and no sync.
                            Use <PageLink to="/settings">Settings</PageLink> → Export Backup regularly, and
                            Import Backup to move to another phone or computer.
                        </span>
                    </li>
                </ul>

                <Heads>
                    Clearing your browser data, uninstalling the app, or using a private window
                    deletes everything. Export a backup first.
                </Heads>
            </Section>

            <Section id="faq" title="Frequently asked questions">
                <div className="space-y-2">
                    {[
                        {
                            q: "Why did Safe To Spend drop when I added a bill?",
                            a: "That's on purpose. Tantiya sets the money aside right away so you see what's really free, instead of being surprised near the due date.",
                        },
                        {
                            q: "I added a bill but nothing was reserved.",
                            a: "Its funding cutoff hasn't started yet. For example, a Current Cutoff bill due on the 5th is set aside starting on the 1st. The form's preview says \"Funded by a later cutoff\".",
                        },
                        {
                            q: "Why no warning when I buy gas, even though money is reserved?",
                            a: "If the expense's category has a spending budget and you pay from the budget's account, it can use that budget's money. That's what it was set aside for.",
                        },
                        {
                            q: "Is my opening balance counted as income?",
                            a: "No. Opening balances are recorded as adjustments, so Income in Reports only shows money you actually earned.",
                        },
                        {
                            q: "Does Mark paid count the bill twice?",
                            a: "No. The reserve for that bill is removed when it's paid, and the expense takes its place.",
                        },
                        {
                            q: "What isn't included?",
                            a: "Bank sync, investments, loan schedules, and shared or multi-user accounts.",
                        },
                    ].map(item => (
                        <details
                            key={item.q}
                            className="group rounded-md border border-stone-200 px-3 py-2"
                        >
                            <summary className="cursor-pointer font-medium text-stone-950">
                                {item.q}
                            </summary>
                            <p className="mt-2 text-sm text-stone-600">{item.a}</p>
                        </details>
                    ))}
                </div>
            </Section>

        </div>
    );
}
