import {
    ArrowLeftRight,
    BookOpen,
    CalendarCheck,
    FileChartColumn,
    LayoutDashboard,
    Receipt,
    Settings,
    Tags,
    TrendingUp,
    Wallet,
    type LucideIcon,
} from "lucide-react";

export interface NavItem {
    to: string;
    label: string;
    /** Shorter label for the mobile bottom bar. */
    shortLabel?: string;
    icon: LucideIcon;
    /** Shown directly in the mobile bottom bar (the rest go under More). */
    primary?: boolean;
}

export const navItems: NavItem[] = [
    { to: "/dashboard", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard, primary: true },
    { to: "/guide", label: "Guide", icon: BookOpen },
    { to: "/accounts", label: "Accounts", icon: Wallet },
    { to: "/categories", label: "Categories", icon: Tags },
    { to: "/expenses", label: "Expenses", icon: Receipt, primary: true },
    { to: "/incomes", label: "Incomes", icon: TrendingUp },
    { to: "/transfers", label: "Transfers", icon: ArrowLeftRight },
    { to: "/obligations", label: "Obligations", shortLabel: "Bills", icon: CalendarCheck, primary: true },
    { to: "/reports", label: "Reports", icon: FileChartColumn, primary: true },
    { to: "/settings", label: "Settings", icon: Settings },
];
