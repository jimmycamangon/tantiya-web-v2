import { useEffect } from "react";
import { seedDefaultCategories } from "./db/seed";

import AddAccountForm from "./features/accounts/AddAccountForm";
import AccountList from "./features/accounts/AccountList";
import { getCurrentCutoff } from "./features/cutoffs/getCurrentCutoff";


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
    </div>
  );
}

export default App;