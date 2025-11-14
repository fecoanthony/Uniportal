// controllers/courseController.js
import Course from "../models/Course.Model.js";
import Registration from "../models/Registration.Model.js";
import Result from "../models/Result.Model.js";
import Session from "../models/Session.Model.js";
import User from "../models/User.js";

/**
 * GET /api/courses
 * Optional query: departmentId, sessionId
 */
export const listCourses = async (req, res) => {
  try {
    const { departmentId, sessionId } = req.query;
    const filter = {};
    if (departmentId) filter.department_id = departmentId;
    // (Optional) filter by session/semester_offered if needed
    const courses = await Course.find(filter)
      .populate("department_id", "name")
      .populate("lecturer_id", "name email");
    return res.json(courses);
  } catch (err) {
    console.error("listCourses error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/registrations
 * Body: { course_id, session_id } ; req.user is the student
 */
export const registerCourse = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { course_id, session_id } = req.body;

    if (!course_id || !session_id)
      return res
        .status(400)
        .json({ message: "course_id and session_id are required" });

    // verify course and session exist
    const course = await Course.findById(course_id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const session = await Session.findById(session_id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    // duplicate registration check
    const existing = await Registration.findOne({
      student_id: studentId,
      course_id,
      session_id,
    });
    if (existing)
      return res
        .status(409)
        .json({
          message: "You already registered this course for the session",
        });

    // prerequisite check
    if (course.prerequisites && course.prerequisites.length > 0) {
      // Check if student has passing result for each prereq in ANY previous session
      const passedPrereq = await Promise.all(
        course.prerequisites.map(async (preCourseId) => {
          const r = await Result.findOne({
            student_id: studentId,
            course_id: preCourseId,
            gpa: { $gt: 0 },
          });
          return !!r;
        })
      );
      const allPassed = passedPrereq.every((v) => v === true);
      if (!allPassed)
        return res
          .status(400)
          .json({ message: "Prerequisite courses not satisfied" });
    }

    // credit limit check
    // compute total units already registered (approved+registered) for this student in this session
    const regs = await Registration.find({
      student_id: studentId,
      session_id,
    }).populate("course_id", "credit_units");
    const totalUnits = regs.reduce(
      (s, r) => s + (r.course_id?.credit_units || 0),
      0
    );
    const newTotal = totalUnits + (course.credit_units || 0);

    const MAX_CREDITS = parseInt(
      process.env.MAX_CREDITS_PER_SEMESTER || "24",
      10
    );
    if (newTotal > MAX_CREDITS)
      return res
        .status(400)
        .json({
          message: `Credit limit exceeded. Current: ${totalUnits}, adding ${course.credit_units}, max ${MAX_CREDITS}`,
        });

    // create registration
    const reg = await Registration.create({
      student_id: studentId,
      course_id,
      session_id,
      status: "registered",
    });

    // (Optional) notify admin/lecturer, write audit log

    return res
      .status(201)
      .json({
        message: "Course registered (pending approval if required)",
        registration: reg,
      });
  } catch (err) {
    console.error("registerCourse error", err);
    // handle duplicate key error (unique index) gracefully
    if (err.code === 11000)
      return res.status(409).json({ message: "Duplicate registration" });
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/registrations/me/:sessionId - student views own registrations
 */
export const getMyRegistrations = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { sessionId } = req.params;
    const regs = await Registration.find({
      student_id: studentId,
      session_id: sessionId,
    })
      .populate("course_id", "course_code title credit_units")
      .populate("session_id", "year semester");
    return res.json(regs);
  } catch (err) {
    console.error("getMyRegistrations error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Admin: Approve or reject registration
 * POST /api/admin/registrations/:id/approve  (body: { action: "approve"|"reject" })
 */
export const processRegistration = async (req, res) => {
  try {
    const regId = req.params.id;
    const { action } = req.body;
    if (!["approve", "reject"].includes(action))
      return res.status(400).json({ message: "Invalid action" });

    const reg = await Registration.findById(regId);
    if (!reg)
      return res.status(404).json({ message: "Registration not found" });

    reg.status = action === "approve" ? "approved" : "rejected";
    await reg.save();

    // Optionally notify student, write audit log

    return res.json({
      message: `Registration ${reg.status}`,
      registration: reg,
    });
  } catch (err) {
    console.error("processRegistration error", err);
    return res.status(500).json({ message: "Server error" });
  }
};
