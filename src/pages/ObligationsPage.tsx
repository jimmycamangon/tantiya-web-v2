import AddObligationForm
    from "../features/obligations/AddObligationForm";

import ObligationList
    from "../features/obligations/ObligationList";

export default function ObligationsPage() {

    return (
        <div className="space-y-6">

            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-emerald-700">
                    Planning
                </p>

                <h1 className="text-2xl font-semibold text-stone-950 sm:text-3xl">
                    Obligations
                </h1>

                <p className="max-w-2xl text-sm text-stone-500">
                    Track upcoming bills and set aside money before they are due.
                </p>
            </div>

            <AddObligationForm />

            <ObligationList />

        </div>
    );
}