const User = require("../models/User");
const PasswordReset = require("../models/PasswordReset");
const RegistrationOTP = require("../models/RegistrationOTP");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../services/emailService");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { name, email, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: "User already exists" });

    const otp = generateOTP();
    await RegistrationOTP.deleteMany({ email });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await RegistrationOTP.create({
      name, email, password: hashedPassword, role, otp,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    try {
      await sendEmail(
        email,
        "Verify Your Registration",
        `<h2>Welcome to TeamSync!</h2>
         <p>Your OTP for registration is: <strong>${otp}</strong></p>
         <p>This OTP will expire in 15 minutes.</p>`
      );
    } catch (emailError) {
      throw new Error("Unable to send registration OTP email");
    }

    res.status(200).json({ success: true, message: "OTP sent to your email. Please verify." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyRegistrationOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email, otp } = req.body;
    const regOtp = await RegistrationOTP.findOne({ email, otp });

    if (!regOtp) return res.status(400).json({ success: false, message: "Invalid OTP" });
    if (regOtp.expiresAt < new Date()) return res.status(400).json({ success: false, message: "OTP expired" });

    const user = await User.create({
      name: regOtp.name,
      email: regOtp.email,
      password: regOtp.password,
      role: regOtp.role,
      isVerified: true
    });

    await RegistrationOTP.deleteMany({ email });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: "Invalid email or password" });

    const isHash = user.password.startsWith("$2b$") || user.password.startsWith("$2a$");
    let isMatch = false;

    if (isHash) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = password === user.password;
      if (isMatch) {
        user.password = password;
        user.markModified("password");
      }
    }

    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid email or password" });

    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const otp = generateOTP();
    await PasswordReset.deleteMany({ user: user._id });
    await PasswordReset.create({
      user: user._id, otp, expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    try {
      await sendEmail(
        user.email,
        "Password Reset OTP",
        `<h2>Password Reset Request</h2>
         <p>Your OTP for password reset is: <strong>${otp}</strong></p>
         <p>This OTP will expire in 15 minutes.</p>`
      );
    } catch (emailError) {
      throw new Error("Unable to send password reset OTP email");
    }

    res.json({ success: true, message: "Password reset OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const reset = await PasswordReset.findOne({ user: user._id, otp });
    if (!reset) return res.status(400).json({ success: false, message: "Invalid OTP" });
    if (reset.expiresAt < new Date()) return res.status(400).json({ success: false, message: "OTP expired" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    await PasswordReset.deleteMany({ user: user._id });
    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const resendOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email, type } = req.body;
    const otp = generateOTP();

    if (type === "register") {
      const regOtp = await RegistrationOTP.findOne({ email });
      if (!regOtp) return res.status(400).json({ success: false, message: "Registration not found" });
      
      regOtp.otp = otp;
      regOtp.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await regOtp.save();

      try {
        await sendEmail(
          email,
          "Verify Your Registration",
          `<h2>Welcome to TeamSync!</h2>
           <p>Your new OTP for registration is: <strong>${otp}</strong></p>
           <p>This OTP will expire in 15 minutes.</p>`
        );
      } catch (emailError) {
        throw new Error("Unable to resend registration OTP email");
      }
    } else if (type === "reset") {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      await PasswordReset.deleteMany({ user: user._id });
      await PasswordReset.create({
        user: user._id, otp, expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      });

      try {
        await sendEmail(
          user.email,
          "Password Reset OTP",
          `<h2>Password Reset Request</h2>
           <p>Your new OTP for password reset is: <strong>${otp}</strong></p>
           <p>This OTP will expire in 15 minutes.</p>`
        );
      } catch (emailError) {
        throw new Error("Unable to resend password reset OTP email");
      }
    }

    res.json({ success: true, message: "New OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { name, avatar, password } = req.body;

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;

    if (password) {
      user.password = password;
      user.markModified("password");
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTeamMembers = async (req, res) => {
  try {
    const members = await User.find({ role: "TEAM_MEMBER" }).select("name email role");
    res.json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  verifyRegistrationOTP,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
  resendOTP,
  updateProfile,
  getTeamMembers,
};
