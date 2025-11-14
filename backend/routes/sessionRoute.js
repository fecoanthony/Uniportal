// routes/sessionRoute.js
import express from "express";
import { getActiveSession } from "../controllers/sessionController.js";

const router = express.Router();

// public endpoint — frontend calls this to discover the current active session
router.get("/active", getActiveSession);

export default router;
