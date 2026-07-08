import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (user?.role === "MANAGER" || user?.role === "ADMIN") {
      return <Navigate to="/dashboard/manager" replace />;
    }
    return <Navigate to="/dashboard/member" replace />;
  }

  return children;
};

export default ProtectedRoute;
