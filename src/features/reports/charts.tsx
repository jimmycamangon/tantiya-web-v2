import {
    useLayoutEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";

/*
 * Small SVG charts for the Reports page. No chart library, so they
 * work offline and stay light. Specs follow the dataviz guide:
 * 2px lines, <=24px bars with 4px rounded data-ends, hairline grid,
 * one y-axis, legend for 2+ series, hover tooltips on every chart.
 */

import { formatCompact, formatPeso, useChartColors } from "./chartTheme";

function useWidth<T extends HTMLElement>() {
    const ref = useRef<T>(null);
    const [width, setWidth] = useState(0);

    useLayoutEffect(() => {
        const element = ref.current;

        if (!element) {
            return;
        }

        const observer = new ResizeObserver(entries => {
            setWidth(Math.floor(entries[0].contentRect.width));
        });

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    return [ref, width] as const;
}

/** Clean axis ticks from 0 to a rounded max. */
function niceTicks(max: number, count = 4): number[] {
    if (max <= 0) {
        return [0, 1];
    }

    const rough = max / count;
    const magnitude = 10 ** Math.floor(Math.log10(rough));
    const step = [1, 2, 2.5, 5, 10]
        .map(m => m * magnitude)
        .find(s => s >= rough) ?? rough;

    const ticks: number[] = [];

    for (let value = 0; value < max + step * 0.999; value += step) {
        ticks.push(value);
    }

    return ticks;
}

/** Bar/column path: 4px rounded data-end, square at the baseline. */
function columnPath(x: number, y: number, w: number, h: number) {
    const r = Math.min(4, w / 2, h);

    if (h <= 0) {
        return "";
    }

    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

function barPath(x: number, y: number, w: number, h: number) {
    const r = Math.min(4, h / 2, w);

    if (w <= 0) {
        return "";
    }

    return `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x}Z`;
}

export interface LegendItem {
    label: string;
    color: string;
    kind: "line" | "rect" | "tick";
}

export function Legend({ items }: { items: LegendItem[] }) {
    return (
        <div className="mb-3 flex flex-wrap gap-4 text-xs text-stone-600">
            {items.map(item => (
                <span key={item.label} className="inline-flex items-center gap-1.5">
                    <svg width="16" height="10" aria-hidden="true">
                        {item.kind === "line" && (
                            <line x1="1" y1="5" x2="15" y2="5" stroke={item.color} strokeWidth="2" strokeLinecap="round" />
                        )}
                        {item.kind === "rect" && (
                            <rect x="2" y="1" width="12" height="8" rx="2" fill={item.color} />
                        )}
                        {item.kind === "tick" && (
                            <line x1="8" y1="0" x2="8" y2="10" stroke={item.color} strokeWidth="2" />
                        )}
                    </svg>
                    {item.label}
                </span>
            ))}
        </div>
    );
}

interface TooltipRow {
    label: string;
    value: string;
    color?: string;
}

interface TooltipState {
    x: number;
    y: number;
    title: string;
    rows: TooltipRow[];
}

function Tooltip({ state, width }: { state: TooltipState | null; width: number }) {
    if (!state) {
        return null;
    }

    // Keep the tooltip inside the chart.
    const left = Math.min(Math.max(state.x + 12, 0), Math.max(width - 190, 0));

    return (
        <div
            role="status"
            className="pointer-events-none absolute z-10 min-w-40 rounded-md border border-stone-200 bg-white px-3 py-2 text-xs shadow-md"
            style={{ left, top: Math.max(state.y - 10, 0) }}
        >
            <p className="mb-1 font-medium text-stone-500">{state.title}</p>
            {state.rows.map(row => (
                <p key={row.label} className="flex items-center gap-2">
                    {row.color && (
                        <svg width="12" height="4" aria-hidden="true">
                            <line x1="0" y1="2" x2="12" y2="2" stroke={row.color} strokeWidth="2" />
                        </svg>
                    )}
                    <span className="font-semibold text-stone-950">{row.value}</span>
                    <span className="text-stone-500">{row.label}</span>
                </p>
            ))}
        </div>
    );
}

function ChartFrame({
    children,
    height,
    label,
}: {
    children: (width: number, setTip: (t: TooltipState | null) => void) => ReactNode;
    height: number;
    label: string;
}) {
    const [ref, width] = useWidth<HTMLDivElement>();
    const [tip, setTip] = useState<TooltipState | null>(null);

    return (
        <div ref={ref} className="relative w-full" style={{ height }}>
            {width > 0 && (
                <svg
                    width={width}
                    height={height}
                    role="img"
                    aria-label={label}
                    onPointerLeave={() => setTip(null)}
                    className="block overflow-visible"
                >
                    {children(width, setTip)}
                </svg>
            )}
            <Tooltip state={tip} width={width} />
        </div>
    );
}

function YAxis({
    ticks,
    y,
    left,
    right,
}: {
    ticks: number[];
    y: (value: number) => number;
    left: number;
    right: number;
}) {
    const COLORS = useChartColors();

    return (
        <g>
            {ticks.map(tick => (
                <g key={tick}>
                    <line
                        x1={left}
                        x2={right}
                        y1={y(tick)}
                        y2={y(tick)}
                        stroke={tick === 0 ? COLORS.baseline : COLORS.grid}
                        strokeWidth="1"
                    />
                    <text
                        x={left - 6}
                        y={y(tick)}
                        dy="0.32em"
                        textAnchor="end"
                        fontSize="11"
                        fill={COLORS.muted}
                        style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                        {formatCompact(tick)}
                    </text>
                </g>
            ))}
        </g>
    );
}

/* ---------------- Spending pace (cumulative lines) ---------------- */

export interface PaceDatum {
    day: number;
    date: string;
    current: number | null;
    previous: number | null;
}

export function PaceChart({
    points,
    currentLabel,
    previousLabel,
}: {
    points: PaceDatum[];
    currentLabel: string;
    previousLabel: string;
}) {
    const COLORS = useChartColors();
    const height = 220;
    const margin = { top: 10, right: 16, bottom: 24, left: 56 };

    const max = Math.max(
        1,
        ...points.map(p => Math.max(p.current ?? 0, p.previous ?? 0))
    );
    const ticks = niceTicks(max);
    const top = ticks[ticks.length - 1];

    return (
        <>
            <Legend
                items={[
                    { label: currentLabel, color: COLORS.series1, kind: "line" },
                    { label: previousLabel, color: COLORS.previous, kind: "line" },
                ]}
            />
            <ChartFrame height={height} label="Cumulative spending, this period vs previous period">
                {(width, setTip) => {
                    const innerW = width - margin.left - margin.right;
                    const innerH = height - margin.top - margin.bottom;
                    const n = Math.max(points.length - 1, 1);
                    const x = (i: number) => margin.left + (i / n) * innerW;
                    const y = (v: number) => margin.top + innerH - (v / top) * innerH;

                    const path = (key: "current" | "previous") =>
                        points
                            .map((p, i) => (p[key] === null ? null : `${x(i)},${y(p[key] as number)}`))
                            .filter(Boolean)
                            .map((pt, i) => `${i === 0 ? "M" : "L"}${pt}`)
                            .join("");

                    const lastCurrent = [...points].reverse().find(p => p.current !== null);
                    const lastIndex = lastCurrent ? points.indexOf(lastCurrent) : -1;

                    const labelEvery = Math.ceil(points.length / Math.max(Math.floor(innerW / 60), 1));

                    return (
                        <g
                            onPointerMove={event => {
                                const rect = (event.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                                const px = event.clientX - rect.left;
                                const i = Math.round(((px - margin.left) / innerW) * n);
                                const index = Math.min(Math.max(i, 0), points.length - 1);
                                const point = points[index];

                                setTip({
                                    x: x(index),
                                    y: margin.top,
                                    title: `Day ${point.day} · ${point.date}`,
                                    rows: [
                                        {
                                            label: currentLabel,
                                            value: point.current === null ? "—" : formatPeso(point.current),
                                            color: COLORS.series1,
                                        },
                                        {
                                            label: previousLabel,
                                            value: point.previous === null ? "—" : formatPeso(point.previous),
                                            color: COLORS.previous,
                                        },
                                    ],
                                });
                            }}
                        >
                            <rect x={margin.left} y={margin.top} width={innerW} height={innerH} fill="transparent" />
                            <YAxis ticks={ticks} y={y} left={margin.left} right={width - margin.right} />

                            {points.map((p, i) =>
                                i % labelEvery === 0 || i === points.length - 1 ? (
                                    <text
                                        key={p.date}
                                        x={x(i)}
                                        y={height - 6}
                                        textAnchor="middle"
                                        fontSize="11"
                                        fill={COLORS.muted}
                                    >
                                        {p.date.slice(5).replace("-", "/")}
                                    </text>
                                ) : null
                            )}

                            <path d={path("previous")} fill="none" stroke={COLORS.previous} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                            <path d={path("current")} fill="none" stroke={COLORS.series1} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

                            {lastCurrent && lastCurrent.current !== null && (
                                <>
                                    <circle
                                        cx={x(lastIndex)}
                                        cy={y(lastCurrent.current)}
                                        r="4"
                                        fill={COLORS.series1}
                                        stroke={COLORS.surface}
                                        strokeWidth="2"
                                    />
                                    <text
                                        x={x(lastIndex)}
                                        y={y(lastCurrent.current) - 10}
                                        textAnchor={lastIndex > points.length * 0.8 ? "end" : "middle"}
                                        fontSize="11"
                                        fontWeight="600"
                                        fill={COLORS.primary}
                                    >
                                        {formatCompact(lastCurrent.current)}
                                    </text>
                                </>
                            )}
                        </g>
                    );
                }}
            </ChartFrame>
        </>
    );
}

/* ---------------- Category bars with previous-period tick ---------------- */

export interface CategoryDatum {
    name: string;
    amount: number;
    prevAmount: number;
    count: number;
    share: number;
}

export function CategoryBars({ rows }: { rows: CategoryDatum[] }) {
    const COLORS = useChartColors();
    const rowH = 32;
    const barH = 16;
    const margin = { top: 4, right: 72, bottom: 4, left: 110 };
    const height = margin.top + margin.bottom + rows.length * rowH;

    const max = Math.max(1, ...rows.map(r => Math.max(r.amount, r.prevAmount)));

    return (
        <>
            <Legend
                items={[
                    { label: "This period", color: COLORS.series1, kind: "rect" },
                    { label: "Previous period", color: COLORS.secondary, kind: "tick" },
                ]}
            />
            <ChartFrame height={height} label="Spending by category with previous period marker">
                {(width, setTip) => {
                    const innerW = Math.max(width - margin.left - margin.right, 10);
                    const x = (v: number) => (v / max) * innerW;

                    return rows.map((row, i) => {
                        const yTop = margin.top + i * rowH;
                        const barY = yTop + (rowH - barH) / 2;
                        const delta = row.amount - row.prevAmount;

                        const show = () =>
                            setTip({
                                x: margin.left + x(row.amount),
                                y: yTop,
                                title: row.name,
                                rows: [
                                    { label: `this period · ${row.count} expenses`, value: formatPeso(row.amount), color: COLORS.series1 },
                                    { label: "previous period", value: formatPeso(row.prevAmount), color: COLORS.secondary },
                                    {
                                        label: "change",
                                        value: `${delta >= 0 ? "+" : "−"}${formatPeso(Math.abs(delta))}`,
                                    },
                                    { label: "of spending", value: `${Math.round(row.share * 100)}%` },
                                ],
                            });

                        return (
                            <g
                                key={row.name}
                                tabIndex={0}
                                onPointerMove={show}
                                onFocus={show}
                                onBlur={() => setTip(null)}
                                className="outline-none"
                            >
                                <rect x={0} y={yTop} width={width} height={rowH} fill="transparent" />
                                <text
                                    x={margin.left - 8}
                                    y={yTop + rowH / 2}
                                    dy="0.32em"
                                    textAnchor="end"
                                    fontSize="12"
                                    fill={COLORS.secondary}
                                >
                                    {row.name.length > 16 ? `${row.name.slice(0, 15)}…` : row.name}
                                </text>
                                <line
                                    x1={margin.left}
                                    x2={margin.left}
                                    y1={yTop + 4}
                                    y2={yTop + rowH - 4}
                                    stroke={COLORS.baseline}
                                />
                                <path d={barPath(margin.left, barY, x(row.amount), barH)} fill={COLORS.series1} />
                                {row.prevAmount > 0 && (
                                    <line
                                        x1={margin.left + x(row.prevAmount)}
                                        x2={margin.left + x(row.prevAmount)}
                                        y1={barY - 4}
                                        y2={barY + barH + 4}
                                        stroke={COLORS.secondary}
                                        strokeWidth="2"
                                    />
                                )}
                                <text
                                    x={margin.left + Math.max(x(row.amount), x(row.prevAmount)) + 8}
                                    y={yTop + rowH / 2}
                                    dy="0.32em"
                                    fontSize="11"
                                    fill={COLORS.primary}
                                    style={{ fontVariantNumeric: "tabular-nums" }}
                                >
                                    {formatCompact(row.amount)}
                                </text>
                            </g>
                        );
                    });
                }}
            </ChartFrame>
        </>
    );
}

/* ---------------- Grouped / single columns ---------------- */

export interface ColumnSeries {
    key: string;
    label: string;
    color: string;
}

export function ColumnChart<T extends { label: string }>({
    data,
    series,
    value,
    title,
    tooltipExtra,
    highlightMax = false,
}: {
    data: T[];
    series: ColumnSeries[];
    value: (datum: T, key: string) => number;
    title: string;
    tooltipExtra?: (datum: T) => TooltipRow[];
    highlightMax?: boolean;
}) {
    const COLORS = useChartColors();
    const height = 220;
    const margin = { top: 18, right: 8, bottom: 24, left: 56 };

    const max = Math.max(1, ...data.flatMap(d => series.map(s => value(d, s.key))));
    const ticks = niceTicks(max);
    const top = ticks[ticks.length - 1];

    const maxDatum = highlightMax
        ? data.reduce((best, d) => (value(d, series[0].key) > value(best, series[0].key) ? d : best), data[0])
        : null;

    return (
        <>
            {series.length > 1 && (
                <Legend items={series.map(s => ({ label: s.label, color: s.color, kind: "rect" as const }))} />
            )}
            <ChartFrame height={height} label={title}>
                {(width, setTip) => {
                    const innerW = width - margin.left - margin.right;
                    const innerH = height - margin.top - margin.bottom;
                    const band = innerW / Math.max(data.length, 1);
                    const gap = 2;
                    const colW = Math.min(24, (band * 0.7 - gap * (series.length - 1)) / series.length);
                    const groupW = colW * series.length + gap * (series.length - 1);
                    const y = (v: number) => margin.top + innerH - (v / top) * innerH;

                    return (
                        <g>
                            <YAxis ticks={ticks} y={y} left={margin.left} right={width - margin.right} />

                            {data.map((d, i) => {
                                const groupX = margin.left + i * band + (band - groupW) / 2;

                                const show = () =>
                                    setTip({
                                        x: groupX + groupW / 2,
                                        y: margin.top,
                                        title: d.label,
                                        rows: [
                                            ...series.map(s => ({
                                                label: s.label,
                                                value: formatPeso(value(d, s.key)),
                                                color: s.color,
                                            })),
                                            ...(tooltipExtra ? tooltipExtra(d) : []),
                                        ],
                                    });

                                return (
                                    <g
                                        key={d.label}
                                        tabIndex={0}
                                        onPointerMove={show}
                                        onFocus={show}
                                        onBlur={() => setTip(null)}
                                        className="outline-none"
                                    >
                                        <rect
                                            x={margin.left + i * band}
                                            y={margin.top}
                                            width={band}
                                            height={innerH}
                                            fill="transparent"
                                        />
                                        {series.map((s, si) => {
                                            const v = value(d, s.key);
                                            const colX = groupX + si * (colW + gap);

                                            return (
                                                <path
                                                    key={s.key}
                                                    d={columnPath(colX, y(v), colW, y(0) - y(v))}
                                                    fill={s.color}
                                                />
                                            );
                                        })}
                                        {maxDatum === d && value(d, series[0].key) > 0 && (
                                            <text
                                                x={groupX + groupW / 2}
                                                y={y(value(d, series[0].key)) - 6}
                                                textAnchor="middle"
                                                fontSize="11"
                                                fontWeight="600"
                                                fill={COLORS.primary}
                                            >
                                                {formatCompact(value(d, series[0].key))}
                                            </text>
                                        )}
                                        <text
                                            x={margin.left + i * band + band / 2}
                                            y={height - 6}
                                            textAnchor="middle"
                                            fontSize="11"
                                            fill={COLORS.muted}
                                        >
                                            {d.label}
                                        </text>
                                    </g>
                                );
                            })}
                        </g>
                    );
                }}
            </ChartFrame>
        </>
    );
}
