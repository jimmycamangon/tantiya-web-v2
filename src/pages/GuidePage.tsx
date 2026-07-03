export default function GuidePage() {

    return (
        <div className="mx-auto max-w-4xl space-y-10">

            <div>
                <h1 className="text-3xl font-bold">
                    Tantiya Guide
                </h1>

                <p className="mt-2 text-stone-600">
                    Learn how to set up and use Tantiya
                    for personal finance tracking.
                </p>
            </div>

            <section>
                <h2 className="text-xl font-semibold">
                    What is Tantiya?
                </h2>

                <p className="mt-2 text-stone-600">
                    Tantiya is a local-first personal
                    finance tracker designed to help
                    you monitor income, expenses,
                    transfers, and financial
                    obligations without requiring an
                    online account.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold">
                    Recommended Setup
                </h2>

                <ol className="mt-3 list-decimal space-y-2 pl-5 text-stone-600">

                    <li>
                        Create your accounts
                        (Cash, GCash, Maya, Bank).
                    </li>

                    <li>
                        Review or customize
                        categories.
                    </li>

                    <li>
                        Add income entries.
                    </li>

                    <li>
                        Record expenses.
                    </li>

                    <li>
                        Create obligations
                        such as bills or savings goals.
                    </li>

                </ol>
            </section>

            <section>
                <h2 className="text-xl font-semibold">
                    Core Concepts
                </h2>

                <div className="mt-4 space-y-4">

                    <div>
                        <h3 className="font-medium">
                            Accounts
                        </h3>

                        <p className="text-stone-600">
                            Represents where your money
                            is stored.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-medium">
                            Categories
                        </h3>

                        <p className="text-stone-600">
                            Represents what your money
                            is spent on.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-medium">
                            Transfers
                        </h3>

                        <p className="text-stone-600">
                            Moves money between accounts
                            without affecting total balance.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-medium">
                            Obligations
                        </h3>

                        <p className="text-stone-600">
                            Future expenses or savings
                            targets that require funding.
                        </p>
                    </div>

                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold">
                    Dashboard Metrics
                </h2>

                <div className="mt-4 space-y-3 text-stone-600">

                    <p>
                        <strong>Actual Balance</strong>
                        {" "}— Total money across all accounts.
                    </p>

                    <p>
                        <strong>Reserved Amount</strong>
                        {" "}— Amount reserved for obligations.
                    </p>

                    <p>
                        <strong>Available To Spend</strong>
                        {" "}— Actual Balance minus Reserved Amount.
                    </p>

                    <p>
                        <strong>Monthly Summary</strong>
                        {" "}— Income, expenses, and savings for the current month.
                    </p>

                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold">
                    Backup & Restore
                </h2>

                <p className="mt-2 text-stone-600">
                    Use Settings → Export Backup
                    to create a portable JSON backup.
                </p>

                <p className="mt-2 text-stone-600">
                    Use Settings → Import Backup
                    to restore data from another device.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold">
                    Current Scope
                </h2>

                <div className="mt-4 grid gap-6 md:grid-cols-2">

                    <div>
                        <h3 className="font-medium text-emerald-700">
                            Included
                        </h3>

                        <ul className="mt-2 space-y-1 text-stone-600">
                            <li>Accounts</li>
                            <li>Categories</li>
                            <li>Income Tracking</li>
                            <li>Expense Tracking</li>
                            <li>Transfers</li>
                            <li>Obligations</li>
                            <li>Backup & Restore</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-medium text-stone-700">
                            Not Included
                        </h3>

                        <ul className="mt-2 space-y-1 text-stone-600">
                            <li>Bank Sync</li>
                            <li>Investment Tracking</li>
                            <li>Loan Management</li>
                            <li>Multi-user Accounts</li>
                        </ul>
                    </div>

                </div>
            </section>

        </div>
    );
}