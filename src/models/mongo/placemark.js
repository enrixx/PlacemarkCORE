import Mongoose from "mongoose";

const { Schema } = Mongoose;

const placemarkSchema = new Schema({
  name: String,
  description: String,
  latitude: Number,
  longitude: Number,
  images: {
    type: [
      {
        url: String,
        publicId: String,
        uploaderId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    default: [],
  },
  userid: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "Category",
  },
});

export const Placemark = Mongoose.model("Placemark", placemarkSchema);
