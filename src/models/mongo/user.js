import Mongoose from "mongoose";

const { Schema } = Mongoose;

const userSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: String,
  isOAuth: { type: Boolean, default: false },
  passwordResetToken: String,
  passwordResetExpires: Date,
});

export const User = Mongoose.model("User", userSchema);
