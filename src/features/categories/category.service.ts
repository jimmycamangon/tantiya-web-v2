import { db } from "../../db/database";

export async function getCategories() {
  return db.categories
    .filter(category => !category.archived)
    .toArray();
}

export async function createCategory(
    name: string
) {

    const existing =
        await db.categories
            .filter(
                category =>
                    category.name
                        .toLowerCase() ===
                    name
                        .trim()
                        .toLowerCase()
            )
            .first();

    if (existing) {
        throw new Error(
            "Category already exists"
        );
    }

    await db.categories.add({
        id: crypto.randomUUID(),
        name: name.trim(),
        archived: false,
        createdAt:
            new Date()
                .toISOString()
    });
}

export async function getArchivedCategories() {

    return db.categories
        .filter(
            category =>
                category.archived
        )
        .toArray();
}

export async function archiveCategory(
    categoryId: string
) {

    await db.categories.update(
        categoryId,
        {
            archived: true
        }
    );
}

export async function restoreCategory(
    categoryId: string
) {

    await db.categories.update(
        categoryId,
        {
            archived: false
        }
    );
}