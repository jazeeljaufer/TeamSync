import React, { useState, useEffect } from "react";
import TaskTrendChart from "../../components/charts/TaskTrendChart";
import DashboardSummary from "../../components/dashboard/DashboardSummary";
import RecentReports from "../../components/dashboard/RecentReports";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../hooks/useAuth";
import { getMyReports } from "../../services/reportService";
import "./MemberDashboard.css";

const MemberDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await getMyReports();
        setReports(response.reports || []);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <DashboardLayout
      activeItem="dashboard"
      title={`Welcome back, ${user?.name ? user.name.split(' ')[0] : 'Member'}!`}
      subtitle="Here's your performance snapshot for the week."
      contentClassName="member-dashboard"
    >
      {loading ? (
        <div style={{ padding: "32px", textAlign: "center" }}>Loading dashboard analytics...</div>
      ) : (
        <>
          <DashboardSummary reports={reports} />
          <TaskTrendChart reports={reports} />
          <RecentReports initialReports={reports.slice(0, 3)} />
        </>
      )}
    </DashboardLayout>
  );
};

export default MemberDashboard;
