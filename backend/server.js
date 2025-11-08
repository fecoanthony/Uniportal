import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoute from "./routes/authRoute.js";

dotenv.config();

const app = express();
const port = process.env.PORT;

// middlewares
app.use(express.json()); // to parse req.body
// limit shouldn't be too high to prevent DOS
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)

app.use(cookieParser());

// Routes
app.use("/api/auth", authRoute);

app.listen(port, () => {
  console.log("server connected");
  connectDB();
});
