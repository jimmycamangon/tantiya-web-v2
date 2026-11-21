import { useEffect } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useLocation,
} from "react-router-dom";

import { seedDefaultCategories } from "./db/seed";

import Footer from "./components/Footer";
import MobileNav from "./components/MobileNav";
import { navItems } from "./navigation";

import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import AccountsPage from "./pages/AccountsPage";
import ExpensesPage from "./pages/ExpensesPage";
import IncomesPage from "./pages/IncomesPage";
import TransfersPage from "./pages/TransfersPage";
import ObligationsPage from "./pages/ObligationsPage";
import CategoriesPage from "./pages/CategoriesPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import GuidePage
  from "./pages/GuidePage";


function AppLayout() {
  const location = useLocation();

  const isLandingPage = location.pathname === "/";

  if (isLandingPage) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:flex-row lg:pb-0">
        <aside className="sticky top-0 z-30 border-b border-stone-200 bg-white/85 px-4 py-3 backdrop-blur lg:h-screen lg:w-64 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
          <div className="flex items-center justify-between gap-3 lg:mb-8">
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
                <p className="text-sm font-semibold text-stone-950">Tantiya</p>

                <p className="text-xs text-stone-500">
                  Personal finance tracker
                </p>
              </div>
            </NavLink>

            <div className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
              v2
            </div>
          </div>

          {/* Desktop sidebar; phones and tablets use MobileNav at the bottom. */}
          <nav aria-label="Main" className="hidden flex-col gap-1 lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "flex min-w-fit items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-stone-950 text-white shadow-sm"
                        : "text-stone-600 hover:bg-stone-100 hover:text-stone-950",
                    ].join(" ")
                  }
                >
                  <Icon aria-hidden="true" className="h-4 w-4" />

                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            <Routes>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route
                path="/guide"
                element={<GuidePage />}
              />
              <Route path="/accounts" element={<AccountsPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/categories" element={<CategoriesPage />} />

              <Route path="/incomes" element={<IncomesPage />} />

              <Route path="/transfers" element={<TransfersPage />} />

              <Route path="/obligations" element={<ObligationsPage />} />

              <Route path="/reports" element={<ReportsPage />} />

              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </div>

      <MobileNav />
    </div>
  );
}

function App() {
  useEffect(() => {
    seedDefaultCategories();
  }, []);

  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
