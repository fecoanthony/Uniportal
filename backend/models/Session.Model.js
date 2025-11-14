// models/Session.js
import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true, // e.g. "2024/2025 Academic Session"
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    semester: {
      type: String,
      enum: ["First", "Second", "Third"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false, // mark current active session
    },
  },
  { timestamps: true }
);

// Optionally ensure only one session isActive at a time
SessionSchema.pre("save", async function (next) {
  if (this.isActive) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isActive: false } }
    );
  }
  next();
});

export default mongoose.model("Session", SessionSchema);
