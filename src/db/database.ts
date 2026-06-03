import Dexie from "dexie";
import type { Table } from "dexie";

import type { Account } from "../types/account";
import type { Category } from "../types/category";
import type { Cutoff } from "../types/cutoff";
import type { Income } from "../types/income";
import type { Expense } from "../types/expense";
import type { Obligation } from "../types/obligation";
import type { Transfer } from "../types/transfer";
import type { Adjustment } from "../types/adjustment";

export class TantiyaDB extends Dexie {
  accounts!: Table<Account>;
  categories!: Table<Category>;
  cutoffs!: Table<Cutoff>;
  incomes!: Table<Income>;
  expenses!: Table<Expense>;
  obligations!: Table<Obligation>;
  transfers!: Table<Transfer>;
  adjustments!: Table<Adjustment>;

  constructor() {
    super("TantiyaDB");

    this.version(1).stores({
      accounts: "id,name,archived",
      categories: "id,name,archived",
      cutoffs: "id,startDate,endDate",

      incomes: "id,date,accountId,cutoffId",

      expenses:
        "id,isDeleted,date,accountId,categoryId,cutoffId",

      obligations:
        "id,name,accountId,recurrenceType,fundingRule,active",

      transfers:
        "id,date,fromAccountId,toAccountId,isDeleted",

      adjustments: "id,date,accountId",
    });
  }
}

export const db = new TantiyaDB();