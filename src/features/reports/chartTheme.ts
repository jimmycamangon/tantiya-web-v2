import { useResolvedTheme } from "../../useTheme";

/*
 * Chart colors per theme, validated with the dataviz palette checker:
 * light against the white card, dark against the stone-900 card.
 */
export const CHART_COLORS = {
    light: {
        series1: "#2a78d6", // blue: this period / income
        series2: "#eb6834", // orange: expenses
        previous: "#a8a6a0", // de-emphasized comparison
        grid: "#e1e0d9",
        baseline: "#c3c2b7",
        muted: "#898781",
        secondary: "#52514e",
        primary: "#0b0b0b",
        surface: "#ffffff",
    },
    dark: {
        series1: "#3987e5",
        series2: "#d95926",
        previous: "#6f6b66",
        grid: "#292524",
        baseline: "#44403c",
        muted: "#a8a29e",
        secondary: "#d6d3d1",
        primary: "#f5f5f4",
        surface: "#1c1917",
    },
};

export type ChartColors = typeof CHART_COLORS.light;

export function useChartColors(): ChartColors {
    return CHART_COLORS[useResolvedTheme()];
}

const compactPeso = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    notation: "compact",
    maximumFractionDigits: 1,
});

const fullPeso = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
});

export const formatCompact = (value: number) => compactPeso.format(value);
export const formatPeso = (value: number) => fullPeso.format(value);
