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

// Optional: Add method to auto-calculate grade + GPA
ResultSchema.pre("save", function (next) {
  if (this.score >= 70) (this.grade = "A"), (this.gpa = 5.0);
  else if (this.score >= 60) (this.grade = "B"), (this.gpa = 4.0);
  else if (this.score >= 50) (this.grade = "C"), (this.gpa = 3.0);
  else if (this.score >= 45) (this.grade = "D"), (this.gpa = 2.0);
  else if (this.score >= 40) (this.grade = "E"), (this.gpa = 1.0);
  else (this.grade = "F"), (this.gpa = 0.0);
  next();
});

const Result = mongoose.model("Result", resultSchema);
export default Result;
