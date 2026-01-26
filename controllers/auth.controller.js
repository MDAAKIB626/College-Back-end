// controllers/authController.js
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

    // 1. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Hash OTP
    const hashedOtp = await bcrypt.hash(otp, 10);

    // 3. Remove old OTPs
    await Otp.deleteMany({ email });

    // 4. Save hashed OTP
    await Otp.create({
      email,
      otp: hashedOtp,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 min
    });

    // 5. Send real OTP via email
    await sendEmail(email, otp);

    res.json({ message: "OTP sent successfully" });
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

    // 1. Find OTP record
    const record = await Otp.findOne({ email });
    if (!record)
      return res.status(400).json({ message: "OTP not found" });

    // 2. Check expiry
    if (record.expiresAt < Date.now()) {
      await Otp.deleteMany({ email });
      return res.status(400).json({ message: "OTP expired" });
    }

    // 3. Compare OTP
    const isMatch = await bcrypt.compare(otp, record.otp);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid OTP" });

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create / Update user
    await User.findOneAndUpdate(
      { email },
      { email, password: hashedPassword, role },
      { upsert: true, new: true }
    );

    // 6. Delete OTP after success
    await Otp.deleteMany({ email });

    res.json({ message: "Account created / password set successfully" });
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
