import { Monitor, Moon, Palette, Sun } from "lucide-react";

import { setThemePreference, type ThemePreference } from "../../theme";
import { useThemePreference } from "../../useTheme";

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
    { value: "system", label: "System", icon: Monitor },
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
];

export default function ThemeSettings() {

    const preference = useThemePreference();

    return (
        <section className="max-w-3xl rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                        <Palette aria-hidden="true" className="h-5 w-5" />
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-stone-950">
                            Appearance
                        </h2>
                        <p className="mt-1 text-sm text-stone-500">
                            System follows your phone or computer setting.
                        </p>
                    </div>
                </div>

                <div
                    role="radiogroup"
                    aria-label="Theme"
                    className="inline-flex rounded-md border border-stone-200 bg-stone-100 p-1"
                >
                    {OPTIONS.map(option => {
                        const Icon = option.icon;
                        const selected = preference === option.value;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                onClick={() => setThemePreference(option.value)}
                                className={[
                                    "inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition",
                                    selected
                                        ? "bg-white text-stone-950 shadow-sm"
                                        : "text-stone-600 hover:text-stone-950",
                                ].join(" ")}
                            >
                                <Icon aria-hidden="true" className="h-4 w-4" />
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
