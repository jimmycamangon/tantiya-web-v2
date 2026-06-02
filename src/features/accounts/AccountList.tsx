// import { useLiveQuery } from "dexie-react-hooks";
// import { db } from "../../db/database";

// export default function AccountList() {
//   const accountsWithBalance = useLiveQuery(async () => {
//     const accounts = await db.accounts
//       .filter((account) => !account.archived)
//       .toArray();

//     const adjustments = await db.adjustments.toArray();

//     return accounts.map((account) => {
//       const balance = adjustments
//         .filter((a) => a.accountId === account.id)
//         .reduce((sum, a) => sum + a.amount, 0);

//       return {
//         ...account,
//         balance,
//       };
//     });
//   }, []);

//   return (
//     <ul>
//       {accountsWithBalance?.map((account) => (
//         <li key={account.id}>
//           {account.name} - ₱{account.balance.toLocaleString()}
//         </li>
//       ))}
//     </ul>
//   );
// }



import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/database";
import { calculateAccountBalance } from "./accountBalance.service";

export default function AccountList() {
    const accountsWithBalance = useLiveQuery(async () => {
        const accounts = await db.accounts.toArray();

        const accountsWithBalance = await Promise.all(
            accounts.map(async account => ({
                ...account,
                balance: await calculateAccountBalance(
                    account.id
                ),
            }))
        );

        return accountsWithBalance;
    }, []);

    return (
        <ul>
            {accountsWithBalance?.map((account) => (
                <li key={account.id}>
                    {account.name} - ₱{account.balance.toLocaleString()}
                </li>
            ))}
        </ul>
    );
}