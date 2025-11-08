import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const setToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 15 * 60 * 1000, // 15 minutes in ms
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  return token;
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "all fields are required" });
    const existingUser = await User.findOne({ $or: [{ name }, { email }] });

    if (existingUser)
      return res.status(400).json({ message: "User already exits" });

    const Salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, Salt);

    const user = new User({ name, email, password: hashPassword });
    await user.save();

    setToken(res, user._id);
    res.status(200).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  // debug logs (remove in production)
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    setToken(res, user._id);

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("token", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    console.log(user);
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getMe controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
