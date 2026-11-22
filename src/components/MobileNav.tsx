import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

import { navItems } from "../navigation";

/**
 * Bottom navigation for phones and tablets (hidden at lg and up,
 * where the sidebar takes over). Four main pages plus a "More"
 * sheet for the rest.
 */
export default function MobileNav() {

    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [openedFrom, setOpenedFrom] = useState(location.pathname);
    const sheetRef = useRef<HTMLDivElement>(null);

    const primary = navItems.filter(item => item.primary);
    const more = navItems.filter(item => !item.primary);

    const moreActive = more.some(item => location.pathname.startsWith(item.to));

    // Close the sheet after navigating to another page.
    const isOpen = open && openedFrom === location.pathname;

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setOpen(false);
            }
        };

        document.addEventListener("keydown", onKey);
        sheetRef.current?.querySelector<HTMLElement>("a")?.focus();

        // Keep the page behind from scrolling while the sheet is open.
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    const tabClass = (active: boolean) =>
        [
            "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-[11px] font-medium transition",
            active ? "text-stone-950" : "text-stone-500 hover:text-stone-800",
        ].join(" ");

    const iconWrap = (active: boolean) =>
        [
            "flex h-7 w-12 items-center justify-center rounded-full transition",
            active ? "bg-stone-950 text-white" : "",
        ].join(" ");

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setOpen(false)}
                    aria-hidden="true"
                />
            )}

            {isOpen && (
                <div
                    ref={sheetRef}
                    id="mobile-more-sheet"
                    role="dialog"
                    aria-modal="true"
                    aria-label="More pages"
                    className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-stone-200 bg-white px-4 pt-3 shadow-xl lg:hidden"
                    style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom))" }}
                >
                    <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-stone-300" aria-hidden="true" />

                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-semibold text-stone-950">More</p>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100"
                            aria-label="Close menu"
                        >
                            <X className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>

                    <nav aria-label="More pages" className="grid grid-cols-3 gap-2">
                        {more.map(item => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setOpen(false)}
                                    className={({ isActive }) =>
                                        [
                                            "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition",
                                            isActive
                                                ? "border-stone-950 bg-stone-950 text-white"
                                                : "border-stone-200 text-stone-700 hover:bg-stone-50",
                                        ].join(" ")
                                    }
                                >
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                    {item.label}
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>
            )}

            <nav
                aria-label="Main"
                className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white/95 backdrop-blur lg:hidden"
                style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
                <div className="mx-auto flex max-w-xl items-stretch gap-1 px-2 py-1.5">
                    {primary.map(item => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) => tabClass(isActive && !isOpen)}
                            >
                                {({ isActive }) => (
                                    <>
                                        <span className={iconWrap(isActive && !isOpen)}>
                                            <Icon className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                        {item.shortLabel ?? item.label}
                                    </>
                                )}
                            </NavLink>
                        );
                    })}

                    <button
                        type="button"
                        onClick={() => {
                            setOpenedFrom(location.pathname);
                            setOpen(value => !(value && openedFrom === location.pathname));
                        }}
                        aria-expanded={isOpen}
                        aria-controls="mobile-more-sheet"
                        className={tabClass(isOpen || moreActive)}
                    >
                        <span className={iconWrap(isOpen || moreActive)}>
                            <Menu className="h-5 w-5" aria-hidden="true" />
                        </span>
                        More
                    </button>
                </div>
            </nav>
        </>
    );
}
