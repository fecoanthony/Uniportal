import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    session_id: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
    status: {
      type: String,
      enum: ["registered", "approved"],
      default: "registered",
    },
  },
  { timestamps: true }
);

const Registration = mongoose.model("Registration", registrationSchema);

export default Registration;
