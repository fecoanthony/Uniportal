// routes/student.js
import express from "express";
import Result from "../models/Result.Model.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = express.Router();

// GET /api/student/results
router.get("/results", authorizeRoles(["student"]), async (req, res) => {
  try {
    const studentId = req.user._id; // set by auth middleware
    const results = await Result.find({ student: studentId })
      .populate("course", "name code credits")
      .populate("student", "name matric_no department");

    res.json({ success: true, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
