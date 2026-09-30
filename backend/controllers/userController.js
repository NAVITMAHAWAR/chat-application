import User from "../model/userModel.js";
import Otp from "../model/otp.model.js";
import bcrypt from "bcrypt";
import { createTokenAndSaveCookie } from "../jwt/generateToken.js";
import { sendOtpEmail } from "../utils/sendEmail.js";

export const signUp = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "password do not match" });
    }

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        status: false,
        message: "All field required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashPassword,
      role: "user",
    });

    await createTokenAndSaveCookie(newUser._id, newUser.role, res);

    res.status(201).json({
      status: true,
      message: "user Register Successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "invalid user and Password" });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked by admin. Contact support.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(404).json({ message: "invalid user and Password" });
    }

    // Update online + login stats
    user.isOnline = true;
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    createTokenAndSaveCookie(user._id, user.role, res);

    res.status(200).json({
      message: "User login successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
};

export const LogOut = async (req, res) => {
  try {
    // Optional: if you protect LogOut with secureRoute later, update here
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ message: "User Logged out Successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "internal server error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const loggedUser = req.user._id;
    const filtredUser = await User.find({ _id: { $ne: loggedUser } }).select(
      "-password",
    );
    res.status(200).json({
      message: "All User find Successfully",
      filtredUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "internal server error" });
  }
};

// ───────── SEND OTP (step 1 of register) ─────────
export const sendRegisterOtp = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Already registered?
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Delete any old OTP for this email
    await Otp.deleteMany({ email: email.toLowerCase() });

    // Save new OTP + temp user data
    await Otp.create({
      email: email.toLowerCase(),
      otp,
      name,
      password: hashedPassword,
      expiresAt,
    });

    // Send email
    await sendOtpEmail(email, otp, name);

    res.status(200).json({
      message: "OTP sent to your email",
      email: email.toLowerCase(),
    });
  } catch (error) {
    console.log("sendRegisterOtp error:", error);
    res
      .status(500)
      .json({ message: "Failed to send OTP. Check email config." });
  }
};

// ───────── VERIFY OTP + CREATE USER (step 2) ─────────
export const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const record = await Otp.findOne({
      email: email.toLowerCase(),
      otp: otp.toString().trim(),
    });

    if (!record) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (record.expiresAt < new Date()) {
      await Otp.deleteMany({ email: email.toLowerCase() });
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }

    // Check again if email got registered in meantime
    const already = await User.findOne({ email: email.toLowerCase() });
    if (already) {
      await Otp.deleteMany({ email: email.toLowerCase() });
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create user
    const newUser = await User.create({
      name: record.name,
      email: record.email,
      password: record.password, // already hashed
      role: "user",
    });

    // Clean OTP
    await Otp.deleteMany({ email: email.toLowerCase() });

    // Login token
    await createTokenAndSaveCookie(newUser._id, newUser.role, res);

    res.status(201).json({
      status: true,
      message: "Registration successful",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.log("verifyRegisterOtp error:", error);
    res.status(500).json({ message: "Server error during verification" });
  }
};

// ───────── RESEND OTP ─────────
export const resendRegisterOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const old = await Otp.findOne({ email: email.toLowerCase() });
    if (!old) {
      return res.status(400).json({
        message: "No pending registration found. Please fill the form again.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    old.otp = otp;
    old.expiresAt = expiresAt;
    await old.save();

    await sendOtpEmail(email, otp, old.name);

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    console.log("resendRegisterOtp error:", error);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};
