// seedCourses.js
// Creates courses and assigns them to lecturers (creates default lecturers if none exist)
import mongoose from "mongoose";
import dotenv from "dotenv";
import Course from "./models/Course.Model.js";
import User from "./models/User.js";
import Department from "./models/Department.Model.js";
import bcrypt from "bcryptjs";

dotenv.config();
const MONGO_URI = process.env.MONGODB_URI;

const DEFAULT_COURSES = [
  {
    course_code: "CSC101",
    title: "Introduction to Programming",
    credit_units: 3,
  },
  {
    course_code: "CSC102",
    title: "Data Structures",
    credit_units: 3,
    prerequisites: ["CSC101"],
  },
  {
    course_code: "CSC201",
    title: "Algorithms",
    credit_units: 3,
    prerequisites: ["CSC102"],
  },
  { course_code: "CSC202", title: "Operating Systems", credit_units: 3 },
  { course_code: "CSC301", title: "Databases", credit_units: 3 },
  {
    course_code: "IT101",
    title: "Intro to Information Systems",
    credit_units: 2,
  },
  { course_code: "MTH101", title: "Calculus I", credit_units: 3 },
  { course_code: "PHY101", title: "Physics I", credit_units: 3 },
];

async function ensureDepartments() {
  const count = await Department.countDocuments();
  if (count > 0) return await Department.find().lean();
  const defaults = [
    { name: "Computer Science" },
    { name: "Information Technology" },
    { name: "Mathematics" },
  ];
  const created = [];
  for (const d of defaults) created.push(await Department.create(d));
  return created;
}

async function ensureLecturers() {
  const lecturers = await User.find({ role: "lecturer" }).lean();
  if (lecturers.length > 0) return lecturers;

  // create 3 default lecturers
  const created = [];
  const password = "Lecturer@123";
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const depts = await Department.find();
  for (let i = 0; i < 3; i++) {
    const name = `Lecturer ${i + 1}`;
    const email = `lecturer${i + 1}@university.edu`;
    const dept = depts[i % depts.length];
    const u = await User.create({
      name,
      email,
      password: hash,
      role: "lecturer",
      department_id: dept._id,
    });
    created.push(u);
    console.log("Created lecturer:", email, "password:", password);
  }
  return created;
}

async function mapPrereqs(courseMap, item) {
  // if prerequisites contain codes, map them to ObjectIds at the end
  if (!item.prerequisites) return [];
  return item.prerequisites
    .map((c) => {
      const found = courseMap.get(c);
      return found ? found._id : null;
    })
    .filter(Boolean);
}

async function seedCourses() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to DB");

  const departments = await ensureDepartments();
  const lecturers = await ensureLecturers();

  // choose default department for CS courses
  const csDept =
    departments.find((d) => /computer/i.test(d.name)) || departments[0];

  // Build a map for course codes -> documents as we create them
  const courseMap = new Map();

  // create courses that don't exist, attach to dept and to lecturers round-robin
  for (let i = 0; i < DEFAULT_COURSES.length; i++) {
    const item = DEFAULT_COURSES[i];
    const code = item.course_code.toUpperCase();

    // check if course exists by code
    const existing = await Course.findOne({ course_code: code });
    if (existing) {
      courseMap.set(code, existing);
      console.log("Skipping existing course:", code);
      continue;
    }

    const lecturer = lecturers[i % lecturers.length];
    const course = await Course.create({
      course_code: code,
      title: item.title,
      credit_units: item.credit_units || 3,
      department_id: csDept._id,
      lecturer_id: lecturer._id,
      semester_offered: item.semester_offered || "2025/2026 - First",
      prerequisites: [], // fill after we have IDs
    });

    courseMap.set(code, course);
    console.log(
      "Created course:",
      code,
      "->",
      item.title,
      "lecturer:",
      lecturer.email
    );
  }

  // second pass: attach prerequisites
  for (const item of DEFAULT_COURSES) {
    if (!item.prerequisites || item.prerequisites.length === 0) continue;
    const courseDoc = courseMap.get(item.course_code.toUpperCase());
    if (!courseDoc) continue;
    const prereqIds = await mapPrereqs(courseMap, item);
    if (prereqIds.length > 0) {
      courseDoc.prerequisites = prereqIds;
      await courseDoc.save();
      console.log("Updated prereqs for", courseDoc.course_code);
    }
  }

  console.log("Seeding courses completed.");
  await mongoose.disconnect();
  process.exit(0);
}

seedCourses().catch((err) => {
  console.error("Error seeding courses:", err);
  process.exit(1);
});
