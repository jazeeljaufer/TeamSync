const { body } = require("express-validator");

const registerValidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").optional().isIn(["TEAM_MEMBER", "MANAGER", "ADMIN"]).withMessage("Invalid role"),
];

const verifyRegistrationValidator = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("6-digit OTP is required"),
];

const resendOTPValidator = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("type").isIn(["register", "reset"]).withMessage("Invalid OTP type"),
];

const loginValidator = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const forgotPasswordValidator = [
  body("email").isEmail().withMessage("Valid email is required"),
];

const resetPasswordValidator = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("6-digit OTP is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

const updateProfileValidator = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("avatar").optional().trim(),
  body("password").optional().isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

module.exports = {
  registerValidator,
  verifyRegistrationValidator,
  resendOTPValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  updateProfileValidator,
};