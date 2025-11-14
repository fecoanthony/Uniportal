// seedAdmin.js (robust version)
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "./config/database.js"; // adjust path if needed
import Department from "./models/Department.Model.js";
import User from "./models/User.js";

dotenv.config();

const ADMIN_EMAIL = process.env.INIT_ADMIN_EMAIL || "admin@university.edu";
const ADMIN_PASS = process.env.INIT_ADMIN_PASS || "Admin@12345";
const ADMIN_NAME = process.env.INIT_ADMIN_NAME || "Site Admin";
const DEPT_NAME = process.env.INIT_ADMIN_DEPT || "Administration";

async function run() {
  try {
    await connectDB();

    // ensure department exists
    let dept = await Department.findOne({ name: DEPT_NAME });
    if (!dept) {
      dept = await Department.create({
        name: DEPT_NAME,
        description: "Auto-created initial admin department",
      });
      console.log("Created department:", dept.name, dept._id.toString());
    } else {
      console.log("Department exists:", dept.name, dept._id.toString());
    }

    // check if admin exists
    const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (existing) {
      console.log(
        "Admin user already exists:",
        existing.email,
        "id:",
        existing._id.toString()
      );
      // show populated user safely
      const popExisting = await User.findById(existing._id)
        .populate("department_id", "name description")
        .exec();
      console.log("Populated existing admin:", popExisting);
      process.exit(0);
    }

    // create admin
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(ADMIN_PASS, salt);

    const admin = new User({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL.toLowerCase(),
      password: hashed,
      role: "admin",
      department_id: dept._id,
    });

    const saved = await admin.save();
    console.log("Admin created (raw):", {
      id: saved._id.toString(),
      email: saved.email,
    });

    // explicit findById + populate to be safe
    const populated = await User.findById(saved._id)
      .populate("department_id", "name description")
      .exec();

    if (!populated.department_id) {
      console.warn(
        "⚠️ Warning: department could not be populated for this admin."
      );
      console.warn("Saved admin.department_id value:", saved.department_id);
      console.warn("Existing departments in DB:");
      const allDepts = await Department.find();
      console.log(allDepts);
    } else {
      console.log("\n✅ Admin (populated):");
      console.log("  name :", populated.name);
      console.log("  email:", populated.email);
      console.log("  role :", populated.role);
      console.log(
        "  dept :",
        populated.department_id.name,
        populated.department_id._id.toString()
      );
    }

    console.log("\nIMPORTANT: change the admin password at first login.");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding admin:", err);
    process.exit(1);
  }
}

run();
