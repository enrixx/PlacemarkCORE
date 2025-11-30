import Mongoose from "mongoose";
import * as dotenv from "dotenv";

export function connectMongo() {
  dotenv.config();

  Mongoose.connect(process.env.DB_MONGODB);
  const db = Mongoose.connection;

  db.on("error", (err) => {
    console.log(`database connection error: ${err}`);
  });

  db.on("disconnected", () => {
    console.log("database disconnected");
  });

  db.once("open", function () {
    console.log(`database connected to ${this.name} on ${this.host}`);
  });
}
