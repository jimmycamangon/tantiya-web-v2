import { useEffect } from "react";
import { seedDefaultCategories } from "./db/seed";

import AddAccountForm from "./features/accounts/AddAccountForm";
import AccountList from "./features/accounts/AccountList";
import { getCurrentCutoff } from "./features/cutoffs/getCurrentCutoff";
import AddExpenseForm from "./features/expenses/AddExpenseForm";
import ExpenseList from "./features/expenses/ExpenseList";
import QuickExpenseInput from "./features/expenses/QuickExpenseInput";
import AddIncomeForm
  from "./features/incomes/AddIncomeForm";
import IncomeList
  from "./features/incomes/IncomeList";
import AddTransferForm
  from "./features/transfers/AddTransferForm";
import AddObligationForm
  from "./features/obligations/AddObligationForm";
import ObligationList
  from "./features/obligations/ObligationList";

function App() {
  useEffect(() => {
    seedDefaultCategories();
  }, []);

  console.log(
    getCurrentCutoff(new Date())
  );

  return (
    <div>
      <h1>Tantiya V2</h1>

      <AddAccountForm />

      <AccountList />

      <hr />

      <QuickExpenseInput />

      <AddExpenseForm />

      <ExpenseList />

      <AddIncomeForm />

      <IncomeList />

      <AddTransferForm />

      <AddObligationForm />

      <ObligationList />
    </div>
  );
}

export default App;