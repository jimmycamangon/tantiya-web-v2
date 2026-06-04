import AddTransferForm
    from "../features/transfers/AddTransferForm";
import TransferList
    from "../features/transfers/TransferList";


export default function TransfersPage() {

    return (
        <>
            <AddTransferForm />

            <TransferList />
        </>
    );
}