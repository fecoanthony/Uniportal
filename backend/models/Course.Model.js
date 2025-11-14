import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    course_code: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    credit_units: { type: Number, required: true },
    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    lecturer_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
    semester_offered: { type: String }, // e.g. "2024/2025 - First"
    prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  },
  { timestamps: true }
);

export default mongoose.model("Course", CourseSchema);
