import express from "express";
import { createDepartment } from "../controllers/createDepartment.js";
import { protectedRoute } from "../middlewares/protectedRoute.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = express.Router();

router.post(
  "/createDepartment",
  protectedRoute,
  authorizeRoles("admin"),
  createDepartment
);

export default router;
