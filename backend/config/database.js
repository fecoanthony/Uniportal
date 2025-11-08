import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("connected to database");
  } catch (error) {
    console.log("error connecting to database", error);
    process.exit(1);
  }
};

export default connectDB;
