/** Chart colors, validated with the dataviz palette checker (light, white surface). */
export const COLORS = {
    series1: "#2a78d6", // blue: this period / income
    series2: "#eb6834", // orange: expenses
    previous: "#a8a6a0", // de-emphasized comparison
    grid: "#e1e0d9",
    baseline: "#c3c2b7",
    muted: "#898781",
    secondary: "#52514e",
    primary: "#0b0b0b",
    surface: "#ffffff",
};

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
