import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./Sidebar.css";

const Sidebar = ({
  activeItem = "dashboard",
  navItems,
  centeredBrand = false,
  showBrandIcon = true,
  isOpen = false,
  onClose,
}) => {
  const { logout, user, getProfile } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(user || {});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        if (response?.user) {
          setProfileData(response.user);
        }
      } catch {
      }
    };
    if (user) {
      fetchProfile();
    }
  }, [getProfile, user]);

  const role = profileData?.role || user?.role;

  const memberLinks = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", href: "/dashboard/member" },
    { id: "reports-create", label: "Create Report", icon: "add_circle", href: "/reports/create" },
    { id: "history", label: "My Reports", icon: "history", href: "/reports/history" },
    { id: "profile", label: "Profile", icon: "person", href: "/profile" },
  ];

  const managerLinks = [
    { id: "dashboard", label: "Team Dashboard", icon: "dashboard", href: "/dashboard/manager" },
    { id: "analytics", label: "Analytics", icon: "analytics", href: "/analytics" },
    { id: "projects", label: "Projects", icon: "tactic", href: "/projects" },
    { id: "profile", label: "Profile", icon: "person", href: "/profile" },
  ];

  let currentNavItems = navItems;
  if (!currentNavItems) {
    if (role === "MANAGER" || role === "ADMIN") {
      currentNavItems = managerLinks;
    } else {
      currentNavItems = memberLinks;
    }
  }

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate("/auth/login");
  };

  const handleNavClick = () => {
    onClose?.();
  };

  return (
    <aside
      className={`sidebar ${isOpen ? "sidebar--open" : ""}`}
      aria-label="Primary navigation"
      aria-hidden={!isOpen ? undefined : false}
    >
      <div className="sidebar__header">
        <div className={`sidebar__brand ${centeredBrand ? "sidebar__brand--centered" : ""}`}>
          {showBrandIcon && (
            <div className="sidebar__brand-icon">
              <span className="material-symbols-outlined">sync</span>
            </div>
          )}
          <div>
            <h1 className="sidebar__brand-title">TeamSync</h1>
            <p className="sidebar__brand-subtitle">Corporate Portal</p>
          </div>
        </div>

        <button
          type="button"
          className="sidebar__close"
          aria-label="Close navigation menu"
          onClick={onClose}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <nav className="sidebar__nav">
        {currentNavItems.map((item) => {
          const isActive = item.id === activeItem || item.active;

          return (
            <Link
              key={item.id || item.label}
              className={`sidebar__nav-link ${isActive ? "sidebar__nav-link--active" : ""}`}
              to={item.href}
              aria-current={isActive ? "page" : undefined}
              onClick={handleNavClick}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar__profile">
        <div
          className="sidebar__user"
          onClick={() => {
            navigate("/profile");
            handleNavClick();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              navigate("/profile");
              handleNavClick();
            }
          }}
          role="button"
          tabIndex={0}
          title="View Profile"
        >
          <div className="sidebar__avatar">
            {profileData.avatar ? (
              <img src={profileData.avatar} alt={profileData.name || "User"} />
            ) : (
              <div className="sidebar__avatar-placeholder">
                {(profileData.name || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="sidebar__user-info">
            <p className="sidebar__user-name">{profileData.name || "User"}</p>
            <p className="sidebar__user-role">
              {(profileData.role || "").replace("_", " ").toLowerCase()}
            </p>
          </div>
        </div>

        <button className="sidebar__logout" type="button" onClick={handleLogout}>
          <span className="material-symbols-outlined">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
