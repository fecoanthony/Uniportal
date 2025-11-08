import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    course_code: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    credit_units: { type: Number, required: true },
    department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    lecturer_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // lecturer
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;
