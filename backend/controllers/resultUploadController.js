// controllers/resultUploadController.js
import { parse } from "csv-parse";
import Result from "../models/Result.Model.js";
import User from "../models/User.js";
import Course from "../models/Course.Model.js";
import Session from "../models/Session.Model.js";
import mongoose from "mongoose";

/**
 * Expected CSV headers (case-insensitive):
 * student_email, student_id (prefer email OR id),
 * course_code, course_id (prefer course_code),
 * session_name, session_id (prefer session_name),
 * score
 *
 * Example row:
 * student_email,course_code,session_name,score
 * student1@uni.edu,CSC101,2024/2025 Academic Session - First Semester,78
 *
 * The controller will try sensible fallbacks:
 * - if student_email present, resolve student by email
 * - if course_code present, resolve course by code
 * - if session_name present, resolve session by name (case-insensitive)
 */

const requiredColumns = new Set(["score"]);
const preferColumns = {
  student: ["student_email", "student_id"],
  course: ["course_code", "course_id"],
  session: ["session_name", "session_id"],
};

export const uploadResults = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res
        .status(400)
        .json({ message: "CSV file is required (field name: file)" });
    }

    // parse CSV (streaming)
    const parser = parse(req.file.buffer, {
      columns: true, // produce objects keyed by header
      skip_empty_lines: true,
      trim: true,
    });

    const successes = [];
    const failures = [];
    let rowIndex = 0;

    // Pre-cache some lookups? We'll resolve per row for correctness.
    for await (const record of parser) {
      rowIndex++;
      const rowErrors = [];

      // normalize keys to lowercase to avoid header-case issues
      const normalized = {};
      for (const k of Object.keys(record)) {
        normalized[k.trim().toLowerCase()] = (record[k] ?? "")
          .toString()
          .trim();
      }

      // score
      const scoreRaw = normalized["score"];
      if (scoreRaw == null || scoreRaw === "") {
        rowErrors.push("Missing 'score' value");
      }
      const scoreNum = Number(scoreRaw);
      if (Number.isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
        rowErrors.push(
          "Invalid 'score' value (must be number between 0 and 100)"
        );
      }

      // student: prefer email then id
      let student = null;
      if (normalized["student_email"]) {
        student = await User.findOne({
          email: normalized["student_email"].toLowerCase(),
        }).select("_id email");
        if (!student)
          rowErrors.push(
            `Student not found for email: ${normalized["student_email"]}`
          );
      } else if (normalized["student_id"]) {
        if (!mongoose.Types.ObjectId.isValid(normalized["student_id"])) {
          rowErrors.push(
            `Invalid student_id ObjectId: ${normalized["student_id"]}`
          );
        } else {
          student = await User.findById(normalized["student_id"]).select(
            "_id email"
          );
          if (!student)
            rowErrors.push(
              `Student not found for id: ${normalized["student_id"]}`
            );
        }
      } else {
        rowErrors.push("Either student_email or student_id is required");
      }

      // course: prefer course_code then id
      let course = null;
      if (normalized["course_code"]) {
        course = await Course.findOne({
          course_code: normalized["course_code"].toUpperCase(),
        }).select("_id course_code");
        if (!course)
          rowErrors.push(
            `Course not found for code: ${normalized["course_code"]}`
          );
      } else if (normalized["course_id"]) {
        if (!mongoose.Types.ObjectId.isValid(normalized["course_id"])) {
          rowErrors.push(
            `Invalid course_id ObjectId: ${normalized["course_id"]}`
          );
        } else {
          course = await Course.findById(normalized["course_id"]).select(
            "_id course_code"
          );
          if (!course)
            rowErrors.push(
              `Course not found for id: ${normalized["course_id"]}`
            );
        }
      } else {
        rowErrors.push("Either course_code or course_id is required");
      }

      // ✅ Lecturer authorization check
      if (
        req.user.role === "lecturer" &&
        course &&
        course.lecturer_id &&
        !course.lecturer_id.equals(req.user._id)
      ) {
        rowErrors.push(
          `You are not authorized to upload results for course ${course.course_code}`
        );
      }

      // session: prefer name then id
      let session = null;
      if (normalized["session_name"]) {
        session = await Session.findOne({
          name: new RegExp(`^${normalized["session_name"]}$`, "i"),
        }).select("_id name");
        if (!session)
          rowErrors.push(
            `Session not found for name: ${normalized["session_name"]}`
          );
      } else if (normalized["session_id"]) {
        if (!mongoose.Types.ObjectId.isValid(normalized["session_id"])) {
          rowErrors.push(
            `Invalid session_id ObjectId: ${normalized["session_id"]}`
          );
        } else {
          session = await Session.findById(normalized["session_id"]).select(
            "_id name"
          );
          if (!session)
            rowErrors.push(
              `Session not found for id: ${normalized["session_id"]}`
            );
        }
      } else {
        rowErrors.push("Either session_name or session_id is required");
      }

      if (rowErrors.length > 0) {
        failures.push({ row: rowIndex, errors: rowErrors, raw: record });
        continue; // skip save for this row
      }

      // At this point we have validated student, course, session and score
      try {
        // Find existing result for that triple
        let result = await Result.findOne({
          student_id: student._id,
          course_id: course._id,
          session_id: session._id,
        });

        if (result) {
          // update score and save to trigger pre-save hook
          result.score = scoreNum;
          await result.save();
          successes.push({
            row: rowIndex,
            action: "updated",
            resultId: result._id.toString(),
          });
        } else {
          // create new result so pre('save') runs
          const created = await Result.create({
            student_id: student._id,
            course_id: course._id,
            session_id: session._id,
            score: scoreNum,
          });
          successes.push({
            row: rowIndex,
            action: "created",
            resultId: created._id.toString(),
          });
        }
      } catch (err) {
        // handle duplicate key error gracefully (unlikely because we checked), or other errors
        failures.push({
          row: rowIndex,
          errors: [err.message || "Save error"],
          raw: record,
        });
        continue;
      }
    } // end for await parser

    return res.status(200).json({
      message: "CSV processed",
      summary: {
        totalRows: successes.length + failures.length,
        successCount: successes.length,
        failureCount: failures.length,
      },
      successes,
      failures,
    });
  } catch (err) {
    console.error("uploadResults error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};
