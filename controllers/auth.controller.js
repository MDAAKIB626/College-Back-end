import User from "../models/User.js";
import Otp from "../models/Otp.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

/* ================= SEND OTP ================= */
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "Email required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({ email });

    await Otp.create({
      email,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    await sendEmail(email, otp);

    res.json({ message: "OTP sent" });
  } catch (err) {
    res.status(500).json({ message: "OTP sending failed" });
  }
};

/* ================= VERIFY OTP ================= */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp, password, role } = req.body;

    if (role === "admin") {
      return res.status(403).json({
        message: "Admin cannot be created via OTP"
      });
    }

    const record = await Otp.findOne({ email, otp });
    if (!record || record.expiresAt < Date.now()) {
      return res.status(400).json({
        message: "Invalid or expired OTP"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.findOneAndUpdate(
      { email },
      { email, password: hashed, role },
      { upsert: true, new: true }
    );

    await Otp.deleteMany({ email });

    res.json({ message: "Password set successfully" });
  } catch (err) {
    res.status(500).json({ message: "OTP verification failed" });
  }
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email, role });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, role });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};
