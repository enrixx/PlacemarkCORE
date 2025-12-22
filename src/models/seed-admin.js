import { db } from "./db.js";

export async function seedAdmin() {
  if (!db.userStore) {
    console.error("Error: db.userStore not initialized. Call db.init() first.");
    return;
  }

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const firstName = process.env.ADMIN_FIRSTNAME;
  const lastName = process.env.ADMIN_LASTNAME;

  if (!email || !password || !firstName || !lastName) {
    console.error("Error: Missing admin environment variables (ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_FIRSTNAME, ADMIN_LASTNAME)");
    return;
  }

  try {
    const existing = await db.userStore.getUserByEmail(email);
    if (existing) {
      console.log("Admin user already exists:", email);
      return;
    }

    const admin = {
      firstName,
      lastName,
      email,
      password,
      role: "admin"
    };

    await db.userStore.addUser(admin);
    console.log("✓ Seeded admin user:", email);
  } catch (error) {
    console.error("Error seeding admin user:", error.message);
  }
}
