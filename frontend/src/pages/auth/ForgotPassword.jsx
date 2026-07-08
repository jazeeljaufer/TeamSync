import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import InputField from "../../components/common/InputField";
import "../../components/forms/AuthForm.css";
import "./AuthPage.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      await forgotPassword(email);
      setStatus({
        type: "success",
        message: "OTP sent to your email. Redirecting...",
      });
      setTimeout(() => {
        navigate("/auth/reset-password", { state: { email } });
      }, 1500);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to send OTP. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-page__background" aria-hidden="true" />
      <div className="auth-page__container">
        <header className="auth-page__header">
          <div className="auth-page__brand-icon">
            <span className="material-symbols-outlined auth-page__brand-symbol">
              lock_reset
            </span>
          </div>
          <h1 className="auth-page__title">Reset Password</h1>
          <p className="auth-page__subtitle">Enter your email to recover your account</p>
        </header>

        <section className="auth-page__card" aria-label="Forgot Password">
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form__fields">
              <InputField
                id="reset-email"
                name="email"
                label="Email Address"
                type="email"
                placeholder="name@company.com"
                icon="mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="auth-form__action" style={{ marginTop: '24px' }}>
              <Button type="submit" size="lg" loading={isSubmitting} className="auth-form__submit">
                {status.type === 'success' ? (
                  <>
                    <span className="material-symbols-outlined">check_circle</span>
                    Sent
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <span className="material-symbols-outlined">send</span>
                  </>
                )}
              </Button>

              {status.message && (
                <p className={`auth-form__status auth-form__status--${status.type}`} role="alert">
                  {status.message}
                </p>
              )}
            </div>
          </form>

          <footer className="auth-page__footer" style={{ marginTop: '24px' }}>
            <p className="auth-page__terms">
              Remembered your password?{" "}
              <Link to="/auth" className="auth-page__terms-link">
                Back to Login
              </Link>
            </p>
          </footer>
        </section>
      </div>
    </main>
  );
};

export default ForgotPassword;
