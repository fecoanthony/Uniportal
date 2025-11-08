import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    year: { type: String, required: true }, // e.g. "2024/2025"
    semester: { type: String, enum: ["First", "Second"], required: true },
  },
  { timestamp: true }
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
