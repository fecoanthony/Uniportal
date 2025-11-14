import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoute from "./routes/authRoute.js";
import departmentRoute from "./routes/departmentRoute.js";
import courseRoutes from "./routes/courseRoutes.js";
import resultRoutes from "./routes/resultRoute.js";

dotenv.config();

const app = express();
const port = process.env.PORT;

// middlewares
app.use(express.json()); // to parse req.body
// limit shouldn't be too high to prevent DOS
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)

app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoute);
app.use("/api/admin", departmentRoute);
app.use("/api/results", resultRoutes);
app.use("/api", courseRoutes);

app.listen(port, () => {
  console.log("server connected");
  connectDB();
});
