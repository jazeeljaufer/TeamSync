import "./SocialButton.css";

const SocialButton = ({ imgSrc, alt = "", icon, text, onClick }) => (
  <button type="button" className="social-button" onClick={onClick}>
    {imgSrc ? (
      <img src={imgSrc} alt={alt} className="social-button__image" />
    ) : (
      <span className="material-symbols-outlined social-button__icon">{icon}</span>
    )}
    <span className="social-button__text">{text}</span>
  </button>
);

export default SocialButton;
