import AddObligationForm
    from "../features/obligations/AddObligationForm";

import ObligationList
    from "../features/obligations/ObligationList";

export default function ObligationsPage() {

    return (
        <>
            <AddObligationForm />

            <ObligationList />
        </>
    );
}