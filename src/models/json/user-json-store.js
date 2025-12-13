import { v4 } from "uuid";
import { db } from "./store-utils.js";

export const userJsonStore = {
  async getAllUsers() {
    await db.read();
    return db.data.users;
  },

  async addUser(user) {
    await db.read();
    user._id = v4();
    user.role = user.role || "user";
    db.data.users.push(user);
    await db.write();
    return user;
  },

  async getUserById(id) {
    await db.read();
    let u = db.data.users.find((user) => user._id === id);
    if (u === undefined) u = null;
    return u;
  },

  async getUserByEmail(email) {
    await db.read();
    let u = db.data.users.find((user) => user.email === email);
    if (u === undefined) u = null;
    return u;
  },

  async deleteUserById(id) {
    await db.read();
    const index = db.data.users.findIndex((user) => user._id === id);
    if (index !== -1) db.data.users.splice(index, 1);
    await db.write();
  },

  async deleteAll() {
    await db.read();
    // Delete all non-admin users to preserve seeded admin
    db.data.users = db.data.users.filter((user) => user.role === "admin");
    await db.write();
  },

  async updateUser(userId, updatedUser) {
    await db.read();
    const user = db.data.users.find((u) => u._id === userId);
    if (user) {
      user.firstName = updatedUser.firstName;
      user.lastName = updatedUser.lastName;
      user.email = updatedUser.email;
      user.password = updatedUser.password;
      user.role = updatedUser.role || "user";
    }
    await db.write();
  },

  async getAdminCount() {
    await db.read();
    return db.data.users.filter((user) => user.role === "admin").length;
  },
};
