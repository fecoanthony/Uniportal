// routes/resultRoute.js
import express from "express";
import multer from "multer";
import { protectedRoute } from "../middlewares/protectedRoute.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { uploadResults } from "../controllers/resultUploadController.js";

const router = express.Router();

// Multer memory storage (file kept in memory as Buffer). Good for moderate-sized CSVs.
// For large files consider diskStorage or streaming upload to S3.
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB; adjust as needed
});

// POST /api/results/upload
router.post(
  "/upload",
  protectedRoute,
  authorizeRoles("lecturer", "admin"),
  upload.single("file"), // form-data key: "file"
  uploadResults
);

export default router;
