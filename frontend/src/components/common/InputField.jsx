import { Link } from "react-router-dom";
import "./InputField.css";

const InputField = ({
  id,
  name,
  label,
  type = "text",
  placeholder,
  icon,
  extraLink,
  value,
  onChange,
  autoComplete,
  required = true,
}) => (
  <div className="input-field">
    <div className="input-field__header">
      <label className="input-field__label" htmlFor={id}>
        {label}
      </label>
      {extraLink && (
        <Link to={extraLink.href} className="input-field__link">
          {extraLink.text}
        </Link>
      )}
    </div>

    <div className="input-field__control">
      <span className="material-symbols-outlined input-field__icon">{icon}</span>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        className="input-field__input"
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
      />
    </div>
  </div>
);

export default InputField;
