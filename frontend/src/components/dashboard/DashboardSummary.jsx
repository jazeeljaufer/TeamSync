import React from "react";
import { Link } from "react-router-dom";
import Button from "../common/Button";
import "./DashboardSummary.css";

const DashboardSummary = ({ reports = [] }) => {
  const submittedReports = reports.filter(r => r.status === 'SUBMITTED');
  const lastReport = submittedReports.length > 0 ? submittedReports[0] : null;
  const lastReportDate = lastReport ? new Date(lastReport.createdAt) : null;

  const getNextFridayDeadline = () => {
    const now = new Date();
    const resultDate = new Date(now.getTime());
    
    const currentDay = now.getDay();
    const distanceToFriday = (5 - currentDay + 7) % 7;
    resultDate.setDate(now.getDate() + (distanceToFriday === 0 && now.getHours() >= 17 ? 7 : distanceToFriday));
    resultDate.setHours(17, 0, 0, 0);
    
    const diffMs = resultDate - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0 || (distanceToFriday === 0 && now.getHours() < 17)) {
      return "Today at 5:00 PM";
    } else if (diffDays === 1) {
      return "Tomorrow at 5:00 PM";
    }
    return `In ${diffDays} days (Friday 5PM)`;
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return date.toLocaleDateString("en-US", { weekday: 'long', month: "short", day: "numeric" });
  };

  return (
    <section className="dashboard-summary" aria-label="Weekly summary">
      <div className="dashboard-summary__card dashboard-summary__card--stats">
        <div className="dashboard-summary__stat">
          <span className="dashboard-summary__label">Last Report Submitted</span>
          <strong className="dashboard-summary__value dashboard-summary__value--primary">
            {lastReportDate ? formatDate(lastReportDate) : "No submissions yet"}
          </strong>
          <span className="dashboard-summary__meta">
            <span className="material-symbols-outlined">check_circle</span>
            {lastReport ? "Verified by manager" : "Awaiting first submission"}
          </span>
        </div>

        <div className="dashboard-summary__divider" />

        <div className="dashboard-summary__stat">
          <span className="dashboard-summary__label">Next Deadline</span>
          <strong className="dashboard-summary__value dashboard-summary__value--tertiary">
            {getNextFridayDeadline()}
          </strong>
          <span className="dashboard-summary__meta">
            <span className="material-symbols-outlined">schedule</span>
            Weekly Sync - Friday 5PM
          </span>
        </div>
      </div>

      <Link to="/reports/create" style={{ textDecoration: 'none' }}>
        <Button className="dashboard-summary__create" ariaLabel="Create new weekly report">
          <span className="material-symbols-outlined dashboard-summary__watermark">add_task</span>
          <span className="dashboard-summary__create-content">
            <span className="dashboard-summary__create-icon">
              <span className="material-symbols-outlined">post_add</span>
            </span>
            <span className="dashboard-summary__create-title">Create New Weekly Report</span>
            <span className="dashboard-summary__create-text">
              Submit your progress
            </span>
          </span>
        </Button>
      </Link>
    </section>
  );
};

export default DashboardSummary;
