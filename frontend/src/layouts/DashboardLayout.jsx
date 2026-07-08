import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import Sidebar from "../components/sidebar/Sidebar";
import { useAuth } from "../hooks/useAuth";
import AIChatWidget from "../pages/ai/AIChatWidget";
import "./DashboardLayout.css";

const TABLET_BREAKPOINT = 1024;

const DashboardLayout = ({
  activeItem,
  navItems,
  user,
  title,
  subtitle,
  searchPlaceholder,
  modeLabel,
  profile,
  showBadge = false,
  showSettings = true,
  showNotifications = true,
  centeredBrand = false,
  children,
  contentClassName = "",
}) => {
  const { user: authUser } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") closeSidebar();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > TABLET_BREAKPOINT) {
        closeSidebar();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (sidebarOpen && window.innerWidth <= TABLET_BREAKPOINT) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className={`dashboard-layout ${sidebarOpen ? "dashboard-layout--sidebar-open" : ""}`}>
      <Sidebar
        activeItem={activeItem}
        navItems={navItems}
        user={user}
        centeredBrand={centeredBrand}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {sidebarOpen && (
        <button
          type="button"
          className="dashboard-layout__overlay"
          aria-label="Close navigation menu"
          onClick={closeSidebar}
        />
      )}

      <div className="dashboard-layout__body">
        <Navbar
          title={title}
          subtitle={subtitle}
          searchPlaceholder={searchPlaceholder}
          modeLabel={modeLabel}
          profile={profile}
          showBadge={showBadge}
          showSettings={showSettings}
          showNotifications={showNotifications}
          onMenuToggle={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />

        <main className={`dashboard-layout__content ${contentClassName}`}>{children}</main>
      </div>

      {authUser && authUser.role === "MANAGER" && <AIChatWidget />}
    </div>
  );
};

export default DashboardLayout;
