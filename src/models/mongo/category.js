import Mongoose from "mongoose";

const { Schema } = Mongoose;

const categorySchema = new Schema({
  name: String,
  description: String,
});

export const Category = Mongoose.model("Category", categorySchema);
