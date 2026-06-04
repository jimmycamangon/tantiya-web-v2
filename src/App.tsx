import { useEffect } from "react";
import { seedDefaultCategories } from "./db/seed";
import {
    BrowserRouter,
    Routes,
    Route,
    Link
} from "react-router-dom";

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

function App() {
  useEffect(() => {
    seedDefaultCategories();
  }, []);

return (
    <BrowserRouter>

        <h1>
            Tantiya V2
        </h1>

        <nav>

            <Link to="/">
                Dashboard
            </Link>

            {" | "}

            <Link to="/accounts">
                Accounts
            </Link>

            {" | "}

            <Link to="/expenses">
                Expenses
            </Link>

            {" | "}

            <Link to="/incomes">
                Incomes
            </Link>

            {" | "}

            <Link to="/transfers">
                Transfers
            </Link>

            {" | "}

            <Link to="/obligations">
                Obligations
            </Link>

        </nav>

        <hr />

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

        </Routes>

    </BrowserRouter>
);
}

export default App;