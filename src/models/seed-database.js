import { db } from "./db.js";
import { seedCategories, seedPlacemarks } from "./fixtures.js";

export async function seedDatabase() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.log("No ADMIN_EMAIL in environment, skipping seeding.");
      return;
    }

    const user = await db.userStore.getUserByEmail(adminEmail);
    if (!user) {
      console.log("Admin user not found, skipping seeding.");
      return;
    }

    const categoryMap = {};

    for (const cat of seedCategories) {
      let category = await db.categoryStore.getCategoryByName(cat.name);
      if (!category) {
        category = await db.categoryStore.addCategory(cat);
      }
      categoryMap[cat.name] = category._id;
    }

    for (const pm of seedPlacemarks) {
      const categoryId = categoryMap[pm.categoryName];
      if (categoryId) {
        const existingPlacemarks = await db.placemarkStore.getPlacemarksByUserId(user._id);
        const exists = existingPlacemarks.find((p) => p.name === pm.name);

        if (!exists) {
          const newPlacemark = {
            name: pm.name,
            description: pm.description,
            latitude: pm.latitude,
            longitude: pm.longitude,
            categoryId: categoryId,
            categoryName: pm.categoryName,
          };
          await db.placemarkStore.addPlacemark(user._id, newPlacemark);
        }
      }
    }
    console.log("Database seeding completed.");
  } catch (e) {
    console.error("Error seeding database:", e);
  }
}
