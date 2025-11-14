// seedDepartments.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import Department from "./models/Department.Model.js";
import connectDB from "./config/database.js";

dotenv.config();

const departments = [
  {
    name: "Computer Science",
    description: "Department of Computer Science and Software Engineering",
  },
  {
    name: "Mathematics",
    description: "Department of Mathematics and Statistics",
  },
  {
    name: "Business Administration",
    description: "Department of Business Administration and Management",
  },
  {
    name: "Accounting",
    description: "Department of Accounting and Finance",
  },
  {
    name: "Nursing Science",
    description: "Department of Nursing and Health Sciences",
  },
  {
    name: "Chemistry",
    description: "Department of Physical and Life Sciences",
  },
];

// 3️⃣ seed function
const seedDepartments = async () => {
  await connectDB();

  try {
    // optional: clear existing departments before adding new ones
    await Department.deleteMany();
    console.log("🗑️ Old departments removed");

    // insert new departments
    await Department.insertMany(departments);
    console.log("✅ Departments seeded successfully");

    // show all departments
    const allDepts = await Department.find();
    console.log("📋 Inserted departments:", allDepts);

    process.exit();
  } catch (error) {
    console.error("❌ Error seeding departments:", error);
    process.exit(1);
  }
};

seedDepartments();
