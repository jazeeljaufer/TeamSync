const express = require("express");
const router = express.Router();

const {
  register,
  verifyRegistrationOTP,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
  resendOTP,
  updateProfile,
  getTeamMembers
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { otpRateLimiter } = require("../middleware/rateLimiter");

const {
  registerValidator,
  verifyRegistrationValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  resendOTPValidator,
  updateProfileValidator
} = require("../validators/authValidator");

router.post("/register", registerValidator, otpRateLimiter, register);
router.post("/verify-registration", verifyRegistrationValidator, verifyRegistrationOTP);
router.post("/resend-otp", resendOTPValidator, otpRateLimiter, resendOTP);
router.post("/login", loginValidator, login);
router.post("/forgot-password", forgotPasswordValidator, otpRateLimiter, forgotPassword);
router.post("/reset-password", resetPasswordValidator, resetPassword);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfileValidator, updateProfile);
router.get("/team-members", protect, authorize("MANAGER"), getTeamMembers);

module.exports = router;