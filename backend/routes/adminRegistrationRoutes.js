// routes/adminRegistrationRoutes.js
import express from "express";
import { processRegistration } from "../controllers/courseController.js";
import { protectedRoute } from "../middlewares/protectedRoute.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = express.Router();

router.post(
  "/registrations/:id/process",
  protectedRoute,
  authorizeRoles("admin"),
  processRegistration
);

export default router;
