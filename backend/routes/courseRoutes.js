// routes/courseRoutes.js
import express from "express";
import {
  listCourses,
  registerCourse,
  getMyRegistrations,
} from "../controllers/courseController.js";
import { protectedRoute } from "../middlewares/protectedRoute.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = express.Router();

router.get("/courses", protectedRoute, listCourses); // optional: public removal
router.post(
  "/registrations",
  protectedRoute,
  authorizeRoles("student"),
  registerCourse
);
router.get(
  "/registrations/me/:sessionId",
  protectedRoute,
  authorizeRoles("student"),
  getMyRegistrations
);

export default router;
