import { User } from "./user.js";

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
    const newUser = new User(user);
    const userObj = await newUser.save();
    return this.getUserById(userObj._id);
  },

  async getUserByEmail(email) {
    return User.findOne({ email: email }).lean();
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
    await User.deleteMany({});
  },

  async updateUser(id, updatedUser) {
    const user = await User.findOne({ _id: id });
    if (user) {
      user.firstName = updatedUser.firstName;
      user.lastName = updatedUser.lastName;
      user.email = updatedUser.email;
      if (updatedUser.password) user.password = updatedUser.password;
      user.role = updatedUser.role || "user";
      await user.save();
    }
  },

  async getAdminCount() {
    return User.countDocuments({ role: "admin" });
  },
};
