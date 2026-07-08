import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import InputField from "../../components/common/InputField";
import "../../components/forms/AuthForm.css";
import "./AuthPage.css";

import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ResetPassword = () => {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  
  const location = useLocation();
  const navigate = useNavigate();
  const { resetPassword, resendOTP } = useAuth();
  
  const email = location.state?.email || "";

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!email) {
      setStatus({ type: "error", message: "Email not provided. Go back and request OTP again." });
      return;
    }
    
    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      await resetPassword({ email, otp, password });
      setStatus({
        type: "success",
        message: "Password reset successfully. Redirecting to login...",
      });
      setTimeout(() => navigate("/auth/login"), 2000);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to reset password. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      setStatus({ type: "error", message: "Email not provided. Go back and request OTP again." });
      return;
    }

    try {
      setStatus({ type: "info", message: "Sending OTP..." });
      await resendOTP({ email, type: "reset" });
      setStatus({ type: "success", message: "A new OTP has been sent to your email." });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Failed to resend OTP." });
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-page__background" aria-hidden="true" />
      <div className="auth-page__container">
        <header className="auth-page__header">
          <div className="auth-page__brand-icon">
            <span className="material-symbols-outlined auth-page__brand-symbol">
              password
            </span>
          </div>
          <h1 className="auth-page__title">Create New Password</h1>
          <p className="auth-page__subtitle">Please enter your new password below</p>
        </header>

        <section className="auth-page__card" aria-label="Reset Password">
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form__fields">
              <InputField
                id="otp"
                name="otp"
                label="6-Digit OTP"
                type="text"
                placeholder="123456"
                icon="pin"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <InputField
                id="new-password"
                name="password"
                label="New Password"
                type="password"
                placeholder="********"
                icon="lock"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputField
                id="confirm-password"
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="********"
                icon="lock_clock"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            
            <div className="auth-form__action" style={{ marginTop: '24px' }}>
              <Button type="submit" size="lg" loading={isSubmitting} className="auth-form__submit">
                {status.type === 'success' ? (
                  <>
                    <span className="material-symbols-outlined">check_circle</span>
                    Reset Success
                  </>
                ) : (
                  <>
                    Reset Password
                    <span className="material-symbols-outlined">save</span>
                  </>
                )}
              </Button>

              {status.message && (
                <p className={`auth-form__status auth-form__status--${status.type}`} role={status.type === "error" ? "alert" : "status"}>
                  {status.message}
                </p>
              )}
            </div>
          </form>
          
          <footer className="auth-page__footer" style={{ marginTop: '24px' }}>
            <p className="auth-page__terms">
              Didn't receive the code?{" "}
              <button 
                type="button" 
                onClick={handleResendOTP} 
                className="auth-page__terms-link" 
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "inherit", fontFamily: "inherit" }}
              >
                Resend OTP
              </button>
            </p>
            <p className="auth-page__terms" style={{ marginTop: "12px" }}>
              Back to{" "}
              <Link to="/auth" className="auth-page__terms-link">
                Login
              </Link>
            </p>
          </footer>
        </section>
      </div>
    </main>
  );
};

export default ResetPassword;
