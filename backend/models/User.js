// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // no unique
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true }, // hashed
    role: {
      type: String,
      enum: ["student", "lecturer", "admin"],
      required: true,
    },
    department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },

    // NEW identifiers
    matric_no: { type: String, unique: true, sparse: true }, // for students
    staff_id: { type: String, unique: true, sparse: true }, // for lecturers/admin

    // optional fields
    level: { type: Number }, // student level/year if you use it
    matric_generation_meta: { type: Object }, // optional debug/meta
  },
  { timestamps: true }
);

/**
 * Helpers to generate identifiers.
 * Strategy:
 *  - Matric: YYYY + DEPTCODE (optional) + 5-digit serial (e.g. 2025CS00042)
 *  - Staff: ST + 4-digit serial (e.g. ST0007)
 *
 * We generate candidate IDs and check DB to avoid collisions (loop until unique or give up after many tries).
 */

// utility functions (kept local to model file)
async function generateUniqueMatric(doc) {
  const year = new Date().getFullYear().toString(); // e.g. "2025"
  // try to derive a short dept code from department name if populated/available
  let deptCode = "GEN";
  try {
    if (
      doc.department_id &&
      typeof doc.department_id === "object" &&
      doc.department_id.name
    ) {
      deptCode = doc.department_id.name
        .replace(/\s+/g, "")
        .slice(0, 3)
        .toUpperCase();
    }
  } catch (_) {}

  const collection = doc.constructor;
  const MAX_TRIES = 10;
  for (let i = 0; i < MAX_TRIES; i++) {
    const serial = Math.floor(10000 + Math.random() * 90000); // 5 digits
    const candidate = `${year}${deptCode}${serial}`; // e.g. 2025CS12345
    const exists = await collection
      .findOne({ matric_no: candidate })
      .lean()
      .exec();
    if (!exists) {
      return { matric: candidate, meta: { year, deptCode, serial } };
    }
  }
  throw new Error(
    "Failed to generate unique matric number after multiple attempts"
  );
}

async function generateUniqueStaffId(doc) {
  const collection = doc.constructor;
  const MAX_TRIES = 10;
  for (let i = 0; i < MAX_TRIES; i++) {
    const serial = Math.floor(1000 + Math.random() * 9000); // 4 digits
    const candidate = `ST${serial}`; // e.g. ST1234
    const exists = await collection
      .findOne({ staff_id: candidate })
      .lean()
      .exec();
    if (!exists) return candidate;
  }
  throw new Error("Failed to generate unique staff id after multiple attempts");
}

// Pre-save hook to add identifiers when needed
UserSchema.pre("save", async function (next) {
  try {
    // Only generate for new documents or if the fields are empty
    if (this.isNew) {
      if (this.role === "student") {
        if (!this.matric_no) {
          // If department is an ObjectId, try to populate its name (optional)
          if (this.populated && this.department_id && this.department_id.name) {
            // ok
          } else if (
            this.department_id &&
            typeof this.department_id === "object" &&
            this.department_id.toString
          ) {
            // nothing - if department not populated, generate without dept name
          }
          const { matric, meta } = await generateUniqueMatric(this);
          this.matric_no = matric;
          this.matric_generation_meta = meta;
        }
      } else if (this.role === "lecturer" || this.role === "admin") {
        if (!this.staff_id) {
          const sid = await generateUniqueStaffId(this);
          this.staff_id = sid;
        }
      }
    } else {
      // on updates: if role changed to student and matric empty, create; same for staff
      if (this.isModified("role")) {
        if (this.role === "student" && !this.matric_no) {
          const { matric, meta } = await generateUniqueMatric(this);
          this.matric_no = matric;
          this.matric_generation_meta = meta;
        }
        if (
          (this.role === "lecturer" || this.role === "admin") &&
          !this.staff_id
        ) {
          const sid = await generateUniqueStaffId(this);
          this.staff_id = sid;
        }
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model("User", UserSchema);
