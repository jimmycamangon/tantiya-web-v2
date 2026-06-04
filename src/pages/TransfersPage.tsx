import AddTransferForm
    from "../features/transfers/AddTransferForm";
import TransferList
    from "../features/transfers/TransferList";


export default function TransfersPage() {

    return (
        <div className="space-y-6">

            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-emerald-700">
                    Movement
                </p>

                <h1 className="text-2xl font-semibold text-stone-950 sm:text-3xl">
                    Transfers
                </h1>

                <p className="max-w-2xl text-sm text-stone-500">
                    Move money between accounts without affecting your overall balance.
                </p>
            </div>

            <AddTransferForm />

            <TransferList />

        </div>
    );
}