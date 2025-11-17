import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoute from "./routes/authRoute.js";
import departmentRoute from "./routes/departmentRoute.js";
import courseRoutes from "./routes/courseRoutes.js";
import resultRoutes from "./routes/resultRoute.js";
import sessionRoute from "./routes/sessionRoute.js";
import student from "./routes/student.js";

dotenv.config();

const app = express();
const allowed = [
  "http://localhost:5173",
  "https://uniportal-1-5c28.onrender.com",
  // add other allowed origins here
];
const port = process.env.PORT;

// middlewares
app.use(express.json()); // to parse req.body
// limit shouldn't be too high to prevent DOS
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)

app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (curl, mobile apps)
      if (!origin) return callback(null, true);
      if (allowed.indexOf(origin) === -1) {
        return callback(new Error("Not allowed by CORS"), false);
      }
      return callback(null, true);
    },
    credentials: true, // set true if you send cookies
  })
);

// Routes
app.use("/auth", authRoute);
app.use("/admin", departmentRoute);
app.use("/results", resultRoutes);
app.use("", courseRoutes);
app.use("/sessions", sessionRoute);
app.use("/students", student);

app.listen(port, () => {
  console.log("server connected");
  connectDB();
});
