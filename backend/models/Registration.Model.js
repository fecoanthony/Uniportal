import mongoose from "mongoose";

const RegistrationSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ["registered", "approved", "rejected"],
      default: "registered",
    },
  },
  { timestamps: true }
);

RegistrationSchema.index(
  { student_id: 1, course_id: 1, session_id: 1 },
  { unique: true }
); // prevents duplicates

export default mongoose.model("Registration", RegistrationSchema);
