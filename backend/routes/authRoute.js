import express from "express";
import {
  getMe,
  login,
  logout,
  register,
} from "../controllers/authController.js";
import { protectedRoute } from "../middlewares/protectedRoute.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = express.Router();
router.get("/me", protectedRoute, getMe);

router.post("/register", protectedRoute, authorizeRoles("admin"), register);

router.post("/login", login);

router.post("/logout", logout);

export default router;
