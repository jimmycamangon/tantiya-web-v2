import { db } from "./database";

export async function seedDefaultCategories() {
  const count = await db.categories.count();

  if (count > 0) return;

  const now = new Date().toISOString();

  await db.categories.bulkAdd([
    {
      id: crypto.randomUUID(),
      name: "Food",
      archived: false,
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: "Transportation",
      archived: false,
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: "Bills",
      archived: false,
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: "Shopping",
      archived: false,
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: "Health",
      archived: false,
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: "Entertainment",
      archived: false,
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: "Savings",
      archived: false,
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: "Others",
      archived: false,
      createdAt: now,
    },
  ]);
}