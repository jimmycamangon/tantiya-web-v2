import { useEffect } from "react";
import { seedDefaultCategories } from "./db/seed";
import {
    BrowserRouter,
    Routes,
    Route,
    NavLink
} from "react-router-dom";
import {
    ArrowLeftRight,
    CalendarCheck,
    LayoutDashboard,
    Receipt,
    Settings,
    Tags,
    TrendingUp,
    Wallet
} from "lucide-react";

import Footer
    from "./components/Footer";

import DashboardPage
    from "./pages/DashboardPage";

import AccountsPage
    from "./pages/AccountsPage";

import ExpensesPage
    from "./pages/ExpensesPage";

import IncomesPage
    from "./pages/IncomesPage";

import TransfersPage
    from "./pages/TransfersPage";

import ObligationsPage
    from "./pages/ObligationsPage";

import CategoriesPage
    from "./pages/CategoriesPage";

import SettingsPage
    from "./pages/SettingsPage";

const navItems = [
    {
        to: "/",
        label: "Dashboard",
        icon: LayoutDashboard
    },
    {
        to: "/accounts",
        label: "Accounts",
        icon: Wallet
    },
    {
        to: "/categories",
        label: "Categories",
        icon: Tags
    },
    {
        to: "/expenses",
        label: "Expenses",
        icon: Receipt
    },
    {
        to: "/incomes",
        label: "Incomes",
        icon: TrendingUp
    },
    {
        to: "/transfers",
        label: "Transfers",
        icon: ArrowLeftRight
    },
    {
        to: "/obligations",
        label: "Obligations",
        icon: CalendarCheck
    },
    {
        to: "/settings",
        label: "Settings",
        icon: Settings
    }
];

function App() {
    useEffect(() => {
        seedDefaultCategories();
    }, []);

    return (
        <BrowserRouter>

            <div className="min-h-screen bg-stone-50 text-stone-950">
                <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:flex-row">
                    <aside className="border-b border-stone-200 bg-white/85 px-4 py-4 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
                        <div className="mb-4 flex items-center justify-between gap-3 lg:mb-8">
                            <div>
                                <NavLink
                                    to="/"
                                    className="flex items-center gap-3 transition hover:opacity-90"
                                >
                                    <img
                                        src="./icon.png"
                                        alt="Tantiya"
                                        className="h-10 w-10 rounded-lg object-cover"
                                    />

                                    <div>
                                        <p className="text-sm font-semibold text-stone-950">
                                            Tantiya
                                        </p>

                                        <p className="text-xs text-stone-500">
                                            Personal finance tracker
                                        </p>
                                    </div>
                                </NavLink>
                            </div>

                            <div className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                                v2
                            </div>
                        </div>

                        <nav className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                            {navItems.map(
                                item => {
                                    const Icon =
                                        item.icon;

                                    return (
                                        <NavLink
                                            key={item.to}
                                            to={item.to}
                                            end={item.to === "/"}
                                            className={
                                                ({ isActive }) =>
                                                    [
                                                        "flex min-w-fit items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition",
                                                        isActive
                                                            ? "bg-stone-950 text-white shadow-sm"
                                                            : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"
                                                    ].join(" ")
                                            }
                                        >
                                            <Icon
                                                aria-hidden="true"
                                                className="h-4 w-4"
                                            />
                                            <span>
                                                {item.label}
                                            </span>
                                        </NavLink>
                                    );
                                }
                            )}
                        </nav>
                    </aside>
                    <div className="flex min-w-0 flex-1 flex-col">
                        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
                            <Routes>

                                <Route
                                    path="/"
                                    element={
                                        <DashboardPage />
                                    }
                                />

                                <Route
                                    path="/accounts"
                                    element={
                                        <AccountsPage />
                                    }
                                />

                                <Route
                                    path="/expenses"
                                    element={
                                        <ExpensesPage />
                                    }
                                />

                                <Route
                                    path="/incomes"
                                    element={
                                        <IncomesPage />
                                    }
                                />

                                <Route
                                    path="/transfers"
                                    element={
                                        <TransfersPage />
                                    }
                                />

                                <Route
                                    path="/obligations"
                                    element={
                                        <ObligationsPage />
                                    }
                                />

                                <Route
                                    path="/categories"
                                    element={
                                        <CategoriesPage />
                                    }
                                />
                                <Route
                                    path="/settings"
                                    element={
                                        <SettingsPage />
                                    }
                                />
                            </Routes>
                        </main>
                        <Footer />

                    </div>
                </div>
            </div>

        </BrowserRouter>
    );
}

export default App;
