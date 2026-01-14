import { v4 } from "uuid";
import { hashPassword } from "../../utils/password-utils.js";

let users = [];

export const userMemStore = {
  async getAllUsers() {
    return users;
  },

  async addUser(user) {
    user._id = v4();
    user.role = user.role || "user";
    // Hash password before saving
    if (user.password) {
      user.password = await hashPassword(user.password);
    }
    users.push(user);
    return user;
  },

  async getUserById(id) {
    let u = users.find((user) => user._id === id);
    if (u === undefined) u = null;
    return u;
  },

  async getUserByEmail(email) {
    let u = users.find((user) => user.email === email);
    if (u === undefined) u = null;
    return u;
  },

  async deleteUserById(id) {
    const index = users.findIndex((user) => user._id === id);
    if (index !== -1) users.splice(index, 1);
  },

  async deleteAll() {
    // Delete all non-admin users to preserve seeded admin
    users = users.filter((user) => user.role === "admin");
  },

  async updateUser(userId, updatedUser) {
    const user = users.find((u) => u._id === userId);
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
  },

  async getAdminCount() {
    return users.filter((user) => user.role === "admin").length;
  },
};
