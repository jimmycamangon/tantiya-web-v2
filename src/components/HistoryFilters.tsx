import type {
    HistoryFilterState,
    HistoryPeriod,
} from "../utils/historyFilter";

interface FilterOption {
    value: string;
    label: string;
}

interface HistoryFiltersProps {
    filters: HistoryFilterState;
    onChange: (filters: HistoryFilterState) => void;
    searchPlaceholder: string;
    /** Dropdown filter (e.g. accounts or categories). */
    options: FilterOption[];
    allOptionLabel: string;
    shownCount: number;
    totalCount: number;
    /** Singular and plural nouns for the count line, e.g. ["income", "incomes"]. */
    itemLabel: [string, string];
}

const PERIODS: { value: HistoryPeriod; label: string }[] = [
    { value: "thisMonth", label: "This Month" },
    { value: "lastMonth", label: "Last Month" },
    { value: "allTime", label: "All Time" },
];

export default function HistoryFilters({
    filters,
    onChange,
    searchPlaceholder,
    options,
    allOptionLabel,
    shownCount,
    totalCount,
    itemLabel,
}: HistoryFiltersProps) {

    return (
        <div className="mb-4 space-y-3">
            <input
                value={filters.search}
                onChange={(e) =>
                    onChange({ ...filters, search: e.target.value })
                }
                placeholder={searchPlaceholder}
                className="h-10 w-full max-w-sm rounded-md border border-stone-300 px-3 text-sm"
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="inline-flex w-fit rounded-lg border border-stone-200 bg-stone-100 p-1">
                    {PERIODS.map(period => (
                        <button
                            key={period.value}
                            type="button"
                            onClick={() =>
                                onChange({ ...filters, period: period.value })
                            }
                            className={
                                filters.period === period.value
                                    ? "rounded-md bg-white px-3 py-2 text-sm font-medium text-stone-950 shadow-sm"
                                    : "rounded-md px-3 py-2 text-sm text-stone-600 transition hover:text-stone-950"
                            }
                        >
                            {period.label}
                        </button>
                    ))}
                </div>

                <select
                    value={filters.option}
                    onChange={(e) =>
                        onChange({ ...filters, option: e.target.value })
                    }
                    className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm"
                >
                    <option value="all">{allOptionLabel}</option>

                    {options.map(option => (
                        <option
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            <p className="text-sm text-stone-500">
                Showing {shownCount} of {totalCount}{" "}
                {totalCount === 1 ? itemLabel[0] : itemLabel[1]}
            </p>
        </div>
    );
}