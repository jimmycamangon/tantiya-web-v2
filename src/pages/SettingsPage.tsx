import ExportBackupButton from "../features/settings/ExportBackupButton"
import ImportBackupButton
    from "../features/settings/ImportBackupButton";

export default function SettingsPage() {

    return (
        <>

            <h1>
                Settings
            </h1>

            <ExportBackupButton />


            <ImportBackupButton />
        </>
    );
}