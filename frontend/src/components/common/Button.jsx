import "./Button.css";

const Button = ({
  children,
  type = "button",
  variant = "default",
  size = "md",
  iconOnly = false,
  loading = false,
  disabled = false,
  className = "",
  onClick,
  ariaLabel,
}) => {
  const classNames = [
    "button",
    `button--${variant}`,
    `button--${size}`,
    iconOnly ? "button--icon-only" : "",
    loading ? "button--loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classNames}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={loading}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="material-symbols-outlined button__spinner">
          progress_activity
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
