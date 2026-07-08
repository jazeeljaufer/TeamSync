import { useState } from "react";
import AuthForm from "../../components/forms/AuthForm";
import SocialButton from "../../components/common/SocialButton";
import ToggleTabs from "../../components/common/ToggleTabs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./AuthPage.css";

const googleLogoUrl =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAH6RHHEKQcyeo1iltsMGbgrmsf6BQaRWNmXxUA16_w8bmngWMLtwffcx6f3sUZXIXur6qnU8tdt1Dc6IsHumztntJCUdCsmJALKhWcIjmy8DYk8XYEzGQUxNKfryws7bvXL1U7EKP67Bu7ixJxX0b51JPYUJXZ0VKSy8M7ZgeCYaspyDtzJyO-a6XQPwlaNb3Un-ZzA-lbumeiEBQKWo-B2uRrrXfzpcB-2Mv9nmm0Ygs-t68OepXpt454-ReleMaT43hwjGKhRfeQ";

const initialValues = {
  name: "",
  email: "",
  password: "",
  otp: "",
};

const AuthPage = () => {
  const [mode, setMode] = useState("login");
  const [formValues, setFormValues] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const { login, register, verifyRegistration, resendOTP } = useAuth();
  const navigate = useNavigate();

  const handleFieldChange = (fieldName, value) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [fieldName]: value,
    }));
    setStatus({ type: "", message: "" });
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setFormValues(initialValues);
    setSubmitSuccess(false);
    setStatus({ type: "", message: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setStatus({ type: "", message: "" });

    try {
      if (mode === "login") {
        const response = await login({
          email: formValues.email,
          password: formValues.password,
        });
        handleSuccess(response, "Signed in successfully.");
      } else if (mode === "register") {
        const response = await register({
          name: formValues.name,
          email: formValues.email,
          password: formValues.password,
        });
        setStatus({
          type: "success",
          message: response?.message || "OTP sent to your email. Please verify.",
        });
        setMode("verify-otp");
      } else if (mode === "verify-otp") {
        const response = await verifyRegistration({
          email: formValues.email,
          otp: formValues.otp,
        });
        handleSuccess(response, "Registration successful.");
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccess = (response, defaultMessage) => {
    setSubmitSuccess(true);
    setStatus({
      type: "success",
      message: response?.message || defaultMessage,
    });

    window.setTimeout(() => {
      setSubmitSuccess(false);
      if (response?.user?.role === "MANAGER" || response?.user?.role === "ADMIN") {
        navigate("/dashboard/manager");
      } else {
        navigate("/dashboard/member");
      }
    }, 1500);
  };

  const handleResendOTP = async () => {
    try {
      setStatus({ type: "info", message: "Sending OTP..." });
      await resendOTP({ email: formValues.email, type: "register" });
      setStatus({ type: "success", message: "A new OTP has been sent." });
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
              sync
            </span>
          </div>
          <h1 className="auth-page__title">TeamSync</h1>
          <p className="auth-page__subtitle">Corporate Portal</p>
        </header>

        <section className="auth-page__card" aria-label="Secure access">
          {mode !== "verify-otp" && (
            <ToggleTabs active={mode} setActive={handleModeChange} />
          )}

          {mode === "verify-otp" && (
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "8px" }}>Verify Email</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>We sent a code to {formValues.email}</p>
            </div>
          )}

          <AuthForm
            mode={mode}
            values={formValues}
            onFieldChange={handleFieldChange}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isSuccess={submitSuccess}
            statusMessage={status.message}
            statusType={status.type}
          />

          <footer className="auth-page__footer" style={{ marginTop: mode === "verify-otp" ? "24px" : "16px" }}>
            {mode === "verify-otp" ? (
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
            ) : (
              <p className="auth-page__terms">
                By continuing, you agree to our{" "}
                <a className="auth-page__terms-link" href="#">
                  Terms of Service
                </a>
              </p>
            )}
          </footer>
        </section>

        {mode !== "verify-otp" && (
          <div className="auth-page__social">
            <SocialButton imgSrc={googleLogoUrl} alt="Google" text="Google" />
            <SocialButton icon="work" text="SSO" />
          </div>
        )}
      </div>
    </main>
  );
};

export default AuthPage;
