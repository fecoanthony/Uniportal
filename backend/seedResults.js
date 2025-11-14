// seedResults.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import Result from "./models/Result.Model.js";

dotenv.config();

const seedResults = async () => {
  try {
    await connectDB();

    // Replace these IDs with actual values from your DB
    const studentId = "PUT_STUDENT_OBJECT_ID_HERE";
    const sessionId = "PUT_SESSION_OBJECT_ID_HERE"; // likely from the "2024/2025 - First" session
    const courseId1 = "PUT_COURSE1_OBJECT_ID_HERE"; // e.g. CSC101
    const courseId2 = "PUT_COURSE2_OBJECT_ID_HERE"; // e.g. CSC102

    const resultsData = [
      {
        student_id: studentId,
        course_id: courseId1,
        session_id: sessionId,
        score: 75, // A
      },
      {
        student_id: studentId,
        course_id: courseId2,
        session_id: sessionId,
        score: 62, // B
      },
    ];

    // Optional: clear old data for this student
    await Result.deleteMany({ student_id: studentId });

    const results = await Result.insertMany(resultsData);
    console.log("✅ Results seeded successfully:");
    results.forEach((r) => console.log(` - ${r._id} | ${r.grade} (${r.gpa})`));

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error seeding results:", err.message);
    mongoose.connection.close();
  }
};

seedResults();
