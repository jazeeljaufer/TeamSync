import Button from "../common/Button";
import "./Navbar.css";

const Navbar = ({
  title = "Welcome back, Ravi!",
  subtitle = "Here's your performance snapshot for the week.",
  searchPlaceholder = "",
  modeLabel = "",
  profile,
  showBadge = false,
  showSettings = true,
  showNotifications = true,
  onMenuToggle,
  sidebarOpen = false,
}) => (
  <header className="navbar">
    <div className="navbar__leading">
      <button
        type="button"
        className="navbar__menu-toggle"
        aria-label={sidebarOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={sidebarOpen}
        onClick={onMenuToggle}
      >
        <span className="material-symbols-outlined">
          {sidebarOpen ? "close" : "menu"}
        </span>
      </button>

      <div className="navbar__copy">
        <h2 className="navbar__title">{title}</h2>
        {subtitle && <p className="navbar__subtitle">{subtitle}</p>}
      </div>
    </div>

    <div className="navbar__actions">
      {searchPlaceholder && (
        <label className="navbar__search">
          <span className="material-symbols-outlined">search</span>
          <input type="search" placeholder={searchPlaceholder} aria-label={searchPlaceholder} />
        </label>
      )}

      {showNotifications && (
        <Button iconOnly ariaLabel="Notifications" className="navbar__icon-button">
          <span className="material-symbols-outlined">notifications</span>
          {showBadge && <span className="navbar__badge" />}
        </Button>
      )}

      {showSettings && (
        <Button iconOnly ariaLabel="Settings" className="navbar__icon-button">
          <span className="material-symbols-outlined">settings</span>
        </Button>
      )}

      {modeLabel && (
        <Button className="navbar__mode">
          <span>{modeLabel}</span>
          <span className="material-symbols-outlined">shield</span>
        </Button>
      )}

      {profile && (
        <div className="navbar__profile">
          <div className="navbar__avatar">
            <img src={profile.avatar} alt={profile.name} />
          </div>
          {profile.name && <span className="navbar__profile-name">{profile.name}</span>}
        </div>
      )}
    </div>
  </header>
);

export default Navbar;
