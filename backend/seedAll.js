// seedAll.js (updated)
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import Department from "./models/Department.Model.js";
import User from "./models/User.js";
import Session from "./models/Session.Model.js";
import Course from "./models/Course.Model.js";

dotenv.config();
const MONGO_URI = process.env.MONGODB_URI;

const DEFAULT_DEPARTMENTS = [
  { name: "Computer Science", description: "CS Dept" },
  { name: "Information Technology", description: "IT Dept" },
  { name: "Mathematics", description: "Math Dept" },
];

const DEFAULT_SESSIONS = [
  {
    name: "2025/2026 Academic Session",
    startDate: new Date("2025-09-01"),
    endDate: new Date("2026-07-31"),
    semester: "First",
    isActive: true,
  },
];

const COURSES = [
  { course_code: "CSC101", title: "Intro to Programming", credit_units: 3 },
  {
    course_code: "CSC102",
    title: "Data Structures",
    credit_units: 3,
    prerequisites: ["CSC101"],
  },
  // ... add more as required
];

const STUDENT_COUNT = 20;
const DEFAULT_STUDENT_PASSWORD = "Student@123";
const DEFAULT_LECTURER_PASSWORD = "Lecturer@123";

async function ensureDepartments() {
  const existing = await Department.find().lean();
  if (existing.length) return existing;
  const created = [];
  for (const d of DEFAULT_DEPARTMENTS) created.push(await Department.create(d));
  return created;
}

async function ensureSession() {
  let session = await Session.findOne({ isActive: true }).lean();
  if (!session) session = await Session.create(DEFAULT_SESSIONS[0]);
  return session;
}

async function ensureLecturers(departments) {
  let lecturers = await User.find({ role: "lecturer" });
  if (lecturers.length) return lecturers;
  // create default lecturers
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(DEFAULT_LECTURER_PASSWORD, salt);
  const created = [];
  for (let i = 0; i < 3; i++) {
    const name = `Lecturer ${i + 1}`;
    const email = `lecturer${i + 1}@university.edu`;
    const dept = departments[i % departments.length];
    // check by email
    const exists = await User.findOne({ email });
    if (exists) {
      created.push(exists);
      continue;
    }
    const u = new User({
      name,
      email,
      password: hash,
      role: "lecturer",
      department_id: dept._id,
    });
    await u.save(); // pre-save will generate staff_id
    console.log("Created lecturer:", u.email, "staff_id:", u.staff_id);
    created.push(u);
  }
  return created;
}

async function seedCourses(departments, lecturers) {
  const csDept =
    departments.find((d) => /computer/i.test(d.name)) || departments[0];
  const courseMap = new Map();

  for (const item of COURSES) {
    const code = item.course_code.toUpperCase();
    let c = await Course.findOne({ course_code: code });
    if (c) {
      courseMap.set(code, c);
      continue;
    }
    const lecturer = lecturers[Math.floor(Math.random() * lecturers.length)];
    c = await Course.create({
      course_code: code,
      title: item.title,
      credit_units: item.credit_units || 3,
      department_id: csDept._id,
      lecturer_id: lecturer._id,
      semester_offered: "2025/2026 - First",
    });
    courseMap.set(code, c);
    console.log("Created course", code);
  }

  // set prerequisites
  for (const item of COURSES) {
    if (!item.prerequisites) continue;
    const c = courseMap.get(item.course_code.toUpperCase());
    const prereqIds = item.prerequisites
      .map((p) => courseMap.get(p.toUpperCase())?._id)
      .filter(Boolean);
    if (prereqIds.length) {
      c.prerequisites = prereqIds;
      await c.save();
      console.log("Updated prereqs for", c.course_code);
    }
  }
  return courseMap;
}

async function seedStudents(departments) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(DEFAULT_STUDENT_PASSWORD, salt);
  const created = [];
  for (let i = 0; i < STUDENT_COUNT; i++) {
    const name = `Student ${i + 1}`;
    const email = `student${i + 1}@university.edu`;
    const dept = departments[i % departments.length];
    // check by email
    const existing = await User.findOne({ email });
    if (existing) {
      console.log("Skipping existing student:", email);
      continue;
    }
    const user = new User({
      name,
      email,
      password: hash,
      role: "student",
      department_id: dept._id,
      level: 100,
    });
    await user.save(); // pre-save will create matric_no
    console.log("Created student:", user.email, "matric:", user.matric_no);
    created.push(user);
  }
  return created;
}

async function runAll() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected");

  const departments = await ensureDepartments();
  const session = await ensureSession();
  const lecturers = await ensureLecturers(departments);

  await seedCourses(departments, lecturers);
  await seedStudents(departments);

  console.log("SeedAll completed");
  await mongoose.disconnect();
  process.exit(0);
}

runAll().catch((err) => {
  console.error("seedAll error:", err);
  process.exit(1);
});
