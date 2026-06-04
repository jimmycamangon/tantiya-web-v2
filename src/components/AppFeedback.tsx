import {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState
} from "react";
import type { ReactNode }
    from "react";
import {
    AlertTriangle,
    CheckCircle2,
    Info,
    X,
    XCircle
} from "lucide-react";

type ToastType =
    "success" |
    "error" |
    "warning" |
    "info";

type Toast = {
    id: string;
    type: ToastType;
    message: string;
};

type ToastInput = {
    type?: ToastType;
    message: string;
};

type ConfirmOptions = {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: "danger" | "warning";
};

type PendingConfirm = ConfirmOptions & {
    resolve: (value: boolean) => void;
};

type FeedbackContextValue = {
    toast: (input: ToastInput) => void;
    confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const FeedbackContext =
    createContext<FeedbackContextValue | null>(null);

const toastStyles: Record<ToastType, string> = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-red-200 bg-red-50 text-red-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    info: "border-stone-200 bg-white text-stone-900"
};

const toastIcons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
};

export function AppFeedbackProvider({
    children
}: {
    children: ReactNode;
}) {
    const [toasts,
        setToasts] =
        useState<Toast[]>([]);

    const [pendingConfirm,
        setPendingConfirm] =
        useState<PendingConfirm | null>(null);

    const timeoutRefs =
        useRef<Record<string, number>>({});

    const dismissToast =
        useCallback(
            (id: string) => {
                window.clearTimeout(
                    timeoutRefs.current[id]
                );

                delete timeoutRefs.current[id];

                setToasts(
                    current =>
                        current.filter(
                            toast =>
                                toast.id !== id
                        )
                );
            },
            []
        );

    const toast =
        useCallback(
            (input: ToastInput) => {
                const id =
                    crypto.randomUUID();

                const nextToast: Toast = {
                    id,
                    type: input.type ?? "info",
                    message: input.message
                };

                setToasts(
                    current => [
                        nextToast,
                        ...current
                    ].slice(0, 4)
                );

                timeoutRefs.current[id] =
                    window.setTimeout(
                        () => dismissToast(id),
                        3600
                    );
            },
            [dismissToast]
        );

    const confirm =
        useCallback(
            (options: ConfirmOptions) =>
                new Promise<boolean>(
                    resolve => {
                        setPendingConfirm({
                            ...options,
                            resolve
                        });
                    }
                ),
            []
        );

    function closeConfirm(
        value: boolean
    ) {
        pendingConfirm?.resolve(
            value
        );

        setPendingConfirm(
            null
        );
    }

    const confirmTone =
        pendingConfirm?.tone ?? "warning";

    return (
        <FeedbackContext.Provider
            value={{
                toast,
                confirm
            }}
        >
            {children}

            <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
                {toasts.map(
                    item => {
                        const Icon =
                            toastIcons[item.type];

                        return (
                            <div
                                key={item.id}
                                className={`pointer-events-auto flex items-start gap-3 rounded-lg border p-3 text-sm shadow-lg ${toastStyles[item.type]}`}
                            >
                                <Icon
                                    aria-hidden="true"
                                    className="mt-0.5 h-4 w-4 shrink-0"
                                />

                                <p className="min-w-0 flex-1 leading-5">
                                    {item.message}
                                </p>

                                <button
                                    type="button"
                                    title="Dismiss notification"
                                    className="rounded p-0.5 opacity-70 transition hover:bg-black/5 hover:opacity-100"
                                    onClick={() =>
                                        dismissToast(item.id)
                                    }
                                >
                                    <X
                                        aria-hidden="true"
                                        className="h-4 w-4"
                                    />
                                </button>
                            </div>
                        );
                    }
                )}
            </div>

            {pendingConfirm && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-stone-950/35 px-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="w-full max-w-md rounded-lg border border-stone-200 bg-white p-5 shadow-xl"
                    >
                        <div className="flex gap-3">
                            <div className={
                                [
                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
                                    confirmTone === "danger"
                                        ? "bg-red-50 text-red-700"
                                        : "bg-amber-50 text-amber-700"
                                ].join(" ")
                            }>
                                <AlertTriangle
                                    aria-hidden="true"
                                    className="h-5 w-5"
                                />
                            </div>

                            <div className="min-w-0 flex-1">
                                <h2 className="text-base font-semibold text-stone-950">
                                    {pendingConfirm.title}
                                </h2>
                                <p className="mt-1 text-sm leading-6 text-stone-600">
                                    {pendingConfirm.message}
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                className="inline-flex h-10 items-center justify-center rounded-md border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                                onClick={() =>
                                    closeConfirm(false)
                                }
                            >
                                {pendingConfirm.cancelLabel ?? "Cancel"}
                            </button>

                            <button
                                type="button"
                                className={
                                    [
                                        "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold text-white shadow-sm transition",
                                        confirmTone === "danger"
                                            ? "bg-red-700 hover:bg-red-800"
                                            : "bg-amber-600 hover:bg-amber-700"
                                    ].join(" ")
                                }
                                onClick={() =>
                                    closeConfirm(true)
                                }
                            >
                                {pendingConfirm.confirmLabel ?? "Continue"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </FeedbackContext.Provider>
    );
}

export function useToast() {
    const context =
        useContext(
            FeedbackContext
        );

    if (!context) {
        throw new Error(
            "useToast must be used inside AppFeedbackProvider."
        );
    }

    return context.toast;
}

export function useConfirmDialog() {
    const context =
        useContext(
            FeedbackContext
        );

    if (!context) {
        throw new Error(
            "useConfirmDialog must be used inside AppFeedbackProvider."
        );
    }

    return context.confirm;
}
