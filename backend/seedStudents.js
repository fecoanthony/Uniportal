// seedStudents.js
// Usage: node seedStudents.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js"; // adjust path if your User model path differs
import Department from "./models/Department.Model.js"; // adjust path if needed

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

const DEFAULT_DEPARTMENTS = [
  { name: "Computer Science", description: "CS Department" },
  { name: "Information Technology", description: "IT Department" },
  { name: "Mathematics", description: "Mathematics Department" },
  { name: "Physics", description: "Physics Department" },
  { name: "Biology", description: "Biology Department" },
];

const FIRST_NAMES = [
  "Ada",
  "Bola",
  "Chika",
  "Daniel",
  "Efe",
  "Femi",
  "Grace",
  "Hannah",
  "Ike",
  "Jide",
  "Kemi",
  "Lara",
  "Mike",
  "Nkechi",
  "Ola",
  "Pius",
  "Rita",
  "Sade",
  "Tunde",
  "Uchenna",
  "Victor",
  "Wale",
  "Yemi",
  "Zainab",
];

const LAST_NAMES = [
  "Adebayo",
  "Okoro",
  "Ibrahim",
  "Smith",
  "Johnson",
  "Olaitan",
  "Mbachu",
  "Osagie",
  "Musa",
  "Brown",
  "Adamu",
  "Chukwu",
  "Emmanuel",
  "Ogun",
  "Kalu",
  "Abubakar",
  "Eze",
  "Adeyemi",
  "Onyeka",
  "Abiola",
];

function randomName(i) {
  const fn = FIRST_NAMES[i % FIRST_NAMES.length];
  const ln = LAST_NAMES[(i * 7) % LAST_NAMES.length]; // pseudo-random
  return `${fn} ${ln}`;
}

function emailFromName(name, i) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, ".");
  return `${slug}.${i}@university.edu`;
}

async function ensureDepartments() {
  const count = await Department.countDocuments();
  if (count > 0) {
    console.log(`Found ${count} existing departments.`);
    return await Department.find();
  }

  console.log("No departments found. Creating default departments...");
  const created = [];
  for (const d of DEFAULT_DEPARTMENTS) {
    const doc = await Department.create(d);
    created.push(doc);
    console.log("Created department:", doc.name, doc._id.toString());
  }
  return created;
}

async function seedStudents(total = 20) {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected.");

    const departments = await ensureDepartments();
    if (!departments || departments.length === 0) {
      console.error("No departments available — aborting.");
      process.exit(1);
    }

    const createdUsers = [];
    const defaultPassword = "Student@123"; // change as needed
    const salt = await bcrypt.genSalt(10);

    for (let i = 0; i < total; i++) {
      const name = randomName(i);
      const email = emailFromName(name, i + 1); // ensure uniqueness
      const existing = await User.findOne({ email }).lean();
      if (existing) {
        console.log(`Skipping existing user: ${email}`);
        continue;
      }

      const passwordHash = await bcrypt.hash(defaultPassword, salt);
      const dept = departments[i % departments.length];

      const userDoc = new User({
        name,
        email,
        password: passwordHash,
        role: "student",
        department_id: dept._id,
      });

      await userDoc.save();
      createdUsers.push({
        id: userDoc._id.toString(),
        name,
        email,
        dept: dept.name,
      });
      console.log(`Created student: ${email} (${dept.name})`);
    }

    console.log("\nSeeding complete. Summary:");
    console.table(createdUsers);
    console.log(`Default password for created students: ${defaultPassword}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error seeding students:", err);
    try {
      await mongoose.disconnect();
    } catch (_) {}
    process.exit(1);
  }
}

// Run the seeder with default 20 students (change number by calling seedStudents(50) etc)
seedStudents(20);
