import { Link }
    from "react-router-dom";

import ImportBackupButton
    from "../features/settings/ImportBackupButton";

import Footer
    from "../components/Footer";

export default function LandingPage() {

    return (
        <div className="min-h-screen bg-stone-50">

            <main className="mx-auto max-w-5xl px-6 py-20">

                <section className="flex flex-col items-center text-center">

                    <img
                        src="./icon.png"
                        alt="Tantiya"
                        className="h-24 w-24 rounded-3xl shadow-sm"
                    />

                    <h1 className="mt-6 text-5xl font-bold tracking-tight text-stone-900">
                        Tantiya
                    </h1>

                    <p className="mt-4 max-w-xl text-lg text-stone-600">
                        Personal finance, simple.
                    </p>

                    <p className="mt-3 max-w-2xl text-stone-500">
                        Track income, expenses,
                        transfers, and monthly
                        obligations without
                        creating an account.
                        Your data stays on your
                        device.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">

                        <Link
                            to="/dashboard"
                            className="rounded-lg bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
                        >
                            Open Dashboard
                        </Link>

                        <ImportBackupButton />
                        |
                        <Link
                            to="/guide"
                            className="rounded-lg px-5 py-3 text-sm font-medium text-stone-900 transition hover:bg-stone-200 border border-stone-400"
                        >
                            Learn More
                        </Link>

                    </div>

                </section>

                <section className="mt-24">

                    <h2 className="text-xl font-semibold text-stone-900">
                        Why Tantiya?
                    </h2>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">

                        <div className="rounded-xl border border-stone-200 bg-white p-5">
                            <h3 className="font-medium">
                                Local-first
                            </h3>

                            <p className="mt-2 text-sm text-stone-500">
                                Your financial data
                                stays on your device.
                            </p>
                        </div>

                        <div className="rounded-xl border border-stone-200 bg-white p-5">
                            <h3 className="font-medium">
                                No Account Required
                            </h3>

                            <p className="mt-2 text-sm text-stone-500">
                                Open the app and
                                start tracking.
                            </p>
                        </div>

                        <div className="rounded-xl border border-stone-200 bg-white p-5">
                            <h3 className="font-medium">
                                Backup & Restore
                            </h3>

                            <p className="mt-2 text-sm text-stone-500">
                                Export and import
                                your data anytime.
                            </p>
                        </div>

                        <div className="rounded-xl border border-stone-200 bg-white p-5">
                            <h3 className="font-medium">
                                Everyday Budgeting
                            </h3>

                            <p className="mt-2 text-sm text-stone-500">
                                Built for tracking
                                real-world spending
                                and obligations.
                            </p>
                        </div>

                    </div>

                </section>

                <section className="mt-24">

                    <h2 className="text-xl font-semibold text-stone-900">
                        What you can track
                    </h2>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">

                        <div className="rounded-xl border border-stone-200 bg-white p-5">
                            <h3 className="font-medium">
                                Accounts
                            </h3>

                            <p className="mt-2 text-sm text-stone-500">
                                Cash, e-wallets,
                                banks, and more.
                            </p>
                        </div>

                        <div className="rounded-xl border border-stone-200 bg-white p-5">
                            <h3 className="font-medium">
                                Income & Expenses
                            </h3>

                            <p className="mt-2 text-sm text-stone-500">
                                Track where your
                                money comes from
                                and where it goes.
                            </p>
                        </div>

                        <div className="rounded-xl border border-stone-200 bg-white p-5">
                            <h3 className="font-medium">
                                Transfers
                            </h3>

                            <p className="mt-2 text-sm text-stone-500">
                                Move money between
                                your accounts.
                            </p>
                        </div>

                        <div className="rounded-xl border border-stone-200 bg-white p-5">
                            <h3 className="font-medium">
                                Obligations
                            </h3>

                            <p className="mt-2 text-sm text-stone-500">
                                Plan bills,
                                savings goals,
                                and recurring costs.
                            </p>
                        </div>

                    </div>

                </section>

            </main>

            <Footer />

        </div>
    );
}