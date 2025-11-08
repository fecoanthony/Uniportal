import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    session_id: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
    score: { type: Number, required: true },
    grade: { type: String }, // A, B, C, D, F
    gpa: { type: Number },
  },
  { timestamps: true }
);

const Result = mongoose.model("Result", resultSchema);
export default Result;
