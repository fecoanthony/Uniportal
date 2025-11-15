import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const db = process.env.MONGODB_URI;

(async () => {
  await mongoose.connect(db);
  console.log("Connected. Dropping name index...");

  const result = await mongoose.connection.db
    .collection("users")
    .dropIndex("name_1")
    .catch((err) => err);
  console.log(result);

  await mongoose.disconnect();
})();
