// seedSessions.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import Session from "./models/Session.Model.js";

dotenv.config();

const seedSessions = async () => {
  try {
    await connectDB();

    const sessionsData = [
      {
        name: "2024/2025 Academic Session - First Semester",
        startDate: new Date("2024-11-01"),
        endDate: new Date("2025-03-31"),
        semester: "First",
        isActive: true,
      },
      {
        name: "2024/2025 Academic Session - Second Semester",
        startDate: new Date("2025-04-01"),
        endDate: new Date("2025-08-31"),
        semester: "Second",
        isActive: false,
      },
    ];

    await Session.deleteMany(); // clear old data (optional)
    const sessions = await Session.insertMany(sessionsData);
    console.log("✅ Sessions seeded successfully:");
    sessions.forEach((s) => console.log(` - ${s.name} (${s._id})`));

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error seeding sessions:", err.message);
    mongoose.connection.close();
  }
};

seedSessions();
