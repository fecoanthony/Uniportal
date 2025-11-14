// seedFullProject.js
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "./config/database.js";
import Department from "./models/Department.Model.js";
import Session from "./models/Session.Model.js";
import User from "./models/User.js";
import Course from "./models/Course.Model.js";
import Result from "./models/Result.Model.js";

dotenv.config();

async function run() {
  await connectDB();

  // Departments
  const cs = await Department.findOneAndUpdate(
    { name: /computer science/i },
    {
      $setOnInsert: {
        name: "Computer Science",
        description: "Department of Computer Science",
      },
    },
    { upsert: true, new: true }
  );

  // Session
  const session = await Session.findOneAndUpdate(
    { name: "2024/2025 Academic Session - First Semester" },
    {
      $setOnInsert: {
        name: "2024/2025 Academic Session - First Semester",
        startDate: new Date("2024-11-01"),
        endDate: new Date("2025-03-31"),
        semester: "First",
        isActive: true,
      },
    },
    { upsert: true, new: true }
  );

  // Admin
  const adminEmail = process.env.INIT_ADMIN_EMAIL || "admin@university.edu";
  let admin = await User.findOne({ email: adminEmail.toLowerCase() });
  if (!admin) {
    const pass = process.env.INIT_ADMIN_PASS || "Admin@12345";
    const hashed = await bcrypt.hash(pass, 10);
    admin = await User.create({
      name: "Site Admin",
      email: adminEmail.toLowerCase(),
      password: hashed,
      role: "admin",
      department_id: cs._id,
    });
    console.log("Created admin:", admin.email);
  } else console.log("Admin exists:", admin.email);

  // Student
  const studentEmail =
    process.env.TEST_STUDENT_EMAIL || "student1@university.edu";
  let student = await User.findOne({ email: studentEmail.toLowerCase() });
  if (!student) {
    const pass = process.env.TEST_STUDENT_PASS || "Student@123";
    const hashed = await bcrypt.hash(pass, 10);
    student = await User.create({
      name: "Test Student",
      email: studentEmail.toLowerCase(),
      password: hashed,
      role: "student",
      department_id: cs._id,
    });
    console.log("Created student:", student.email);
  } else console.log("Student exists:", student.email);

  // Courses
  const c101 = await Course.findOneAndUpdate(
    { course_code: "CSC101" },
    {
      $setOnInsert: {
        course_code: "CSC101",
        title: "Intro to Computing",
        credit_units: 3,
        department_id: cs._id,
      },
    },
    { upsert: true, new: true }
  );
  const c102 = await Course.findOneAndUpdate(
    { course_code: "CSC102" },
    {
      $setOnInsert: {
        course_code: "CSC102",
        title: "Programming I",
        credit_units: 4,
        department_id: cs._id,
      },
    },
    { upsert: true, new: true }
  );
  // set prereq
  if (!c102.prerequisites || !c102.prerequisites.includes(c101._id)) {
    c102.prerequisites = [c101._id];
    await c102.save();
  }

  // Results: create results for student for CSC101 so prereq satisfied
  let res1 = await Result.findOne({
    student_id: student._id,
    course_id: c101._id,
    session_id: session._id,
  });
  if (!res1) {
    res1 = await Result.create({
      student_id: student._id,
      course_id: c101._id,
      session_id: session._id,
      score: 78,
    });
  } else {
    res1.score = 78;
    await res1.save();
  }

  console.log(
    "Seeding complete. Admin:",
    admin.email,
    "Student:",
    student.email
  );
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
