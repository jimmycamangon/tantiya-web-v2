import { db } from "../../db/database";

export async function getCategories() {
  return db.categories
    .filter(category => !category.archived)
    .toArray();
}