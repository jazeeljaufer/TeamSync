import React from "react";
import Button from "../common/Button";
import InputField from "../common/InputField";
import "./AuthForm.css";

const formContent = {
  login: {
    id: "login-form",
    submitText: "Sign In",
    submitIcon: "login",
    fields: [
      {
        id: "login-email",
        name: "email",
        label: "Email Address",
        type: "email",
        placeholder: "name@company.com",
        icon: "mail",
        autoComplete: "email",
      },
      {
        id: "login-password",
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "********",
        icon: "lock",
        autoComplete: "current-password",
        extraLink: {
          href: "/auth/forgot-password",
          text: "Forgot Password?",
        },
      },
    ],
  },
  register: {
    id: "register-form",
    submitText: "Get Started",
    submitIcon: "how_to_reg",
    fields: [
      {
        id: "register-name",
        name: "name",
        label: "Full Name",
        type: "text",
        placeholder: "John Doe",
        icon: "person",
        autoComplete: "name",
      },
      {
        id: "register-email",
        name: "email",
        label: "Work Email",
        type: "email",
        placeholder: "john.doe@teamsync.io",
        icon: "mail",
        autoComplete: "email",
      },
      {
        id: "register-password",
        name: "password",
        label: "Create Password",
        type: "password",
        placeholder: "Minimum 6 characters",
        icon: "shield",
        autoComplete: "new-password",
      },
    ],
  },
  "verify-otp": {
    id: "verify-otp-form",
    submitText: "Verify Email",
    submitIcon: "verified",
    fields: [
      {
        id: "verify-otp-input",
        name: "otp",
        label: "6-Digit OTP",
        type: "text",
        placeholder: "123456",
        icon: "pin",
        autoComplete: "one-time-code",
      },
    ],
  }
};

const AuthForm = ({
  mode,
  values,
  onFieldChange,
  onSubmit,
  isSubmitting,
  isSuccess,
  statusMessage,
  statusType = "success",
}) => {
  const content = formContent[mode];

  return (
    <form className="auth-form" id={content.id} onSubmit={onSubmit}>
      <div className="auth-form__fields">
        {content.fields.map((field) => (
          <InputField
            key={field.id}
            {...field}
            value={values[field.name] || ""}
            onChange={(event) => onFieldChange(field.name, event.target.value)}
          />
        ))}
      </div>

      <div className="auth-form__action">
        <Button
          type="submit"
          size="lg"
          loading={isSubmitting}
          className="auth-form__submit"
        >
          {isSuccess ? (
            <>
              <span className="material-symbols-outlined">check_circle</span>
              Success
            </>
          ) : (
            <>
              {content.submitText}
              <span className="material-symbols-outlined">{content.submitIcon}</span>
            </>
          )}
        </Button>

        {statusMessage && (
          <p
            className={`auth-form__status auth-form__status--${statusType}`}
            role={statusType === "error" ? "alert" : "status"}
          >
            {statusMessage}
          </p>
        )}
      </div>
    </form>
  );
};

export default AuthForm;
