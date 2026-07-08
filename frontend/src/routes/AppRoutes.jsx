import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthPage from "../pages/auth/AuthPage";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import MemberDashboard from "../pages/dashboard/MemberDashboard";
import ManagerDashboard from "../pages/dashboard/ManagerDashboard";
import CreateReport from "../pages/reports/CreateReport";
import EditReport from "../pages/reports/EditReport";
import MyReports from "../pages/reports/MyReports";
import ReportDetails from "../pages/reports/ReportDetails";
import Analytics from "../pages/analytics/Analytics";
import ProjectManagement from "../pages/projects/ProjectManagement";
import Profile from "../pages/members/Profile";
import NotFound from "../pages/notfound/NotFound";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/login" element={<Navigate to="/auth" replace />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />
      
      <Route 
        path="/dashboard/member" 
        element={
          <ProtectedRoute allowedRoles={["TEAM_MEMBER"]}>
            <MemberDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reports/create" 
        element={
          <ProtectedRoute allowedRoles={["TEAM_MEMBER"]}>
            <CreateReport />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reports/edit/:id" 
        element={
          <ProtectedRoute allowedRoles={["TEAM_MEMBER"]}>
            <EditReport />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reports/history" 
        element={
          <ProtectedRoute allowedRoles={["TEAM_MEMBER"]}>
            <MyReports />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/dashboard/manager" 
        element={
          <ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}>
            <ManagerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}>
            <Analytics />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/projects" 
        element={
          <ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}>
            <ProjectManagement />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/reports/:id" 
        element={
          <ProtectedRoute allowedRoles={["TEAM_MEMBER", "MANAGER", "ADMIN"]}>
            <ReportDetails />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute allowedRoles={["TEAM_MEMBER", "MANAGER", "ADMIN"]}>
            <Profile />
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
