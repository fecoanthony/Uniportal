// seedLecturer.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Department from "./models/Department.Model.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || process.env.DB_URL;

async function seedLecturer() {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected.");

    // 1. Find a department
    const department = await Department.findOne();
    if (!department) {
      console.log(
        "❌ No department found. Create at least one department first."
      );
      process.exit(1);
    }

    console.log("Using department:", department.name);

    // 2. Check if lecturer already exists
    const email = "lecturer1@example.com";
    const exist = await User.findOne({ email });

    if (exist) {
      console.log("Lecturer already exists:", exist.email);
      process.exit(0);
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash("password123", salt);

    // 4. Create lecturer user
    const lecturer = await User.create({
      name: "John Lecturer",
      email: email,
      password: hashPassword,
      role: "lecturer",
      department_id: department._id,
    });

    console.log("✅ Lecturer created successfully:");
    console.log({
      id: lecturer._id,
      email: lecturer.email,
      password: "password123 (default)",
      department: department.name,
    });

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding lecturer:", err);
    process.exit(1);
  }
}

seedLecturer();
