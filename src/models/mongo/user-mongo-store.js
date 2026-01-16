import { User } from "./user.js";
import { hashPassword } from "../../utils/password-utils.js";

export const userMongoStore = {
  async getAllUsers() {
    return User.find().lean();
  },

  async getUserById(id) {
    if (id) {
      try {
        return await User.findOne({ _id: id }).lean();
      } catch (error) {
        return null;
      }
    }
    return null;
  },

  async addUser(user) {
    user.role = user.role || "user";
    // Hash password before saving
    if (user.password) {
      user.password = await hashPassword(user.password);
    }
    const newUser = new User(user);
    const userObj = await newUser.save();
    return this.getUserById(userObj._id);
  },

  async getUserByEmail(email) {
    return User.findOne({ email: { $regex: new RegExp(`^${email}$`, "i") } }).lean();
  },

  async getUserByResetToken(token) {
    return User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    }).lean();
  },

  async deleteUserById(id) {
    try {
      await User.deleteOne({ _id: id });
      return true;
    } catch (error) {
      return false;
    }
  },

  async deleteAll() {
    // Delete all non-admin users to preserve seeded admin
    await User.deleteMany({ role: { $ne: "admin" } });
  },

  async updateUser(id, updatedUser) {
    const user = await User.findOne({ _id: id });
    if (user) {
      if (updatedUser.firstName) user.firstName = updatedUser.firstName;
      if (updatedUser.lastName) user.lastName = updatedUser.lastName;
      if (updatedUser.email) user.email = updatedUser.email;
      // Hash password if it's being updated
      if (updatedUser.password) {
        user.password = await hashPassword(updatedUser.password);
      }
      if (updatedUser.role) user.role = updatedUser.role;
      if (typeof updatedUser.isOAuth === "boolean") user.isOAuth = updatedUser.isOAuth;
      if (updatedUser.passwordResetToken !== undefined) user.passwordResetToken = updatedUser.passwordResetToken;
      if (updatedUser.passwordResetExpires !== undefined) user.passwordResetExpires = updatedUser.passwordResetExpires;
      await user.save();
    }
  },

  async getAdminCount() {
    return User.countDocuments({ role: "admin" });
  },
};
