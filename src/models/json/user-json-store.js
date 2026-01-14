import { v4 } from "uuid";
import { db } from "./store-utils.js";
import { hashPassword } from "../../utils/password-utils.js";

export const userJsonStore = {
  async getAllUsers() {
    await db.read();
    return db.data.users;
  },

  async addUser(user) {
    await db.read();
    user._id = v4();
    user.role = user.role || "user";
    if (user.password) {
      user.password = await hashPassword(user.password);
    }
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
      if (updatedUser.firstName) user.firstName = updatedUser.firstName;
      if (updatedUser.lastName) user.lastName = updatedUser.lastName;
      if (updatedUser.email) user.email = updatedUser.email;
      // Hash password if it's being updated
      if (updatedUser.password) {
        user.password = await hashPassword(updatedUser.password);
      }
      if (updatedUser.role) user.role = updatedUser.role || "user";
      if (typeof updatedUser.isOAuth === "boolean") user.isOAuth = updatedUser.isOAuth;
    }
    await db.write();
  },

  async getAdminCount() {
    await db.read();
    return db.data.users.filter((user) => user.role === "admin").length;
  },
};
