import { v4 } from "uuid";
import { db } from "./json/store-utils.js";
import { userJsonStore } from "./json/user-json-store.js";
import { userMemStore } from "./mem/user-mem-store.js";

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const firstName = process.env.ADMIN_FIRSTNAME;
const lastName = process.env.ADMIN_LASTNAME;

async function seedAdminJson(admin) {
  await db.read();
  const existing = await userJsonStore.getUserByEmail(email);
  if (existing) {
    console.log("Admin user already exists:", email);
    return;
  }
  await userJsonStore.addUser(admin);
  await db.write();
  console.log("Seeded admin user:", email);
}

async function seedAdminMem(admin) {
  const existing = await userMemStore.getUserByEmail(email);
  if (existing) {
    console.log("Admin user already exists:", email);
    return;
  }
  await userMemStore.addUser(admin);
  console.log("Seeded admin user:", email);
}

export async function seedAdmin(storeType) {
  const admin = { _id: v4(), firstName, lastName, email, password, role: "admin" };
  if (storeType === "json") {
    await seedAdminJson(admin);
  } else if (storeType === "mongo") {
    // MongoDB seeding logic would go here
  } else {
    await seedAdminMem(admin);
  }
}





