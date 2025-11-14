import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
import Department from "../models/Department.Model.js";

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
// use your existing imports and setToken function

export const register = async (req, res) => {
  try {
    const { name, email, password, role, department_id } = req.body;
    if (!name || !email || !password || !role || !department_id)
      return res.status(400).json({ message: "all fields are required" });

    const existingUser = await User.findOne({ $or: [{ name }, { email }] });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const department = await Department.findById(department_id);
    if (!department)
      return res.status(400).json({ message: "Invalid department ID" });

    const Salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, Salt);

    const user = new User({
      name,
      email,
      password: hashPassword,
      role,
      department_id,
    });
    await user.save();

    // populate department for convenience
    const populatedUser =
      (await user
        .populate("department_id", "name description")
        .execPopulate?.()) ?? user;

    setToken(res, user._id);

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: populatedUser.department_id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: "User registered successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "Invalid username or password" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ error: "Invalid username or password" });

    setToken(res, user._id);

    const populatedDept = await Department.findById(user.department_id)
      .select("name description")
      .lean()
      .exec();
    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: populatedDept || null,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: safeUser,
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
