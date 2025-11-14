// models/Result.js
import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    session_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      enum: ["A", "B", "C", "D", "E", "F"],
    },
    gpa: {
      type: Number,
      min: 0.0,
      max: 5.0,
    },
    remark: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Pre-save hook to compute grade and GPA automatically
ResultSchema.pre("save", function (next) {
  const score = this.score;
  if (score >= 70) {
    this.grade = "A";
    this.gpa = 5.0;
  } else if (score >= 60) {
    this.grade = "B";
    this.gpa = 4.0;
  } else if (score >= 50) {
    this.grade = "C";
    this.gpa = 3.0;
  } else if (score >= 45) {
    this.grade = "D";
    this.gpa = 2.0;
  } else if (score >= 40) {
    this.grade = "E";
    this.gpa = 1.0;
  } else {
    this.grade = "F";
    this.gpa = 0.0;
  }

  this.remark = this.gpa > 0 ? "Pass" : "Fail";
  next();
});

// Prevent duplicate results for same student/course/session
ResultSchema.index(
  { student_id: 1, course_id: 1, session_id: 1 },
  { unique: true }
);

export default mongoose.model("Result", ResultSchema);
