import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getAllReports } from "../../services/reportService";
import jsPDF from "jspdf";
import "./ManagerDashboard.css";

const ManagerDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ member: "", project: "", status: "", startDate: "", endDate: "" });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await getAllReports();
        setReports(response.reports || []);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const filteredReports = reports.filter(report => {
    const memberMatch = filter.member === "" || (report.user?.name || "").toLowerCase().includes(filter.member.toLowerCase());
    const projectMatch = filter.project === "" || (report.project?.name || "").toLowerCase().includes(filter.project.toLowerCase());
    const statusMatch = filter.status === "" || report.status === filter.status;
    
    let dateMatch = true;
    if (filter.startDate) {
      const start = new Date(filter.startDate);
      start.setHours(0, 0, 0, 0);
      const reportDate = new Date(report.createdAt);
      dateMatch = dateMatch && reportDate >= start;
    }
    if (filter.endDate) {
      const end = new Date(filter.endDate);
      end.setHours(23, 59, 59, 999);
      const reportDate = new Date(report.createdAt);
      dateMatch = dateMatch && reportDate <= end;
    }
    
    return memberMatch && projectMatch && statusMatch && dateMatch;
  });

  const handleClearFilters = () => {
    setFilter({ member: "", project: "", status: "", startDate: "", endDate: "" });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleDownloadPDF = (report) => {
    const doc = new jsPDF();
    const weekRangeDisplay = report.weekStart ? formatDate(report.weekStart) : "Unknown Week";
    const displayStatus = report.status === "SUBMITTED" ? "Submitted" : report.status === "LATE" ? "Late" : report.status === "PENDING" ? "Pending" : "Draft";
    
    doc.setFontSize(20);
    doc.text("Weekly Report", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Date Range: ${weekRangeDisplay}`, 14, 32);
    doc.text(`Member: ${report.user?.name || "Unknown"}`, 14, 38);
    doc.text(`Project: ${report.project?.name || "N/A"}`, 14, 44);
    doc.text(`Status: ${displayStatus}`, 14, 50);
    doc.text(`Hours Worked: ${report.hoursWorked || 0}`, 14, 56);

    let currentY = 66;

    const renderSection = (title, contentArray) => {
      doc.setFontSize(14);
      doc.setTextColor(40);
      doc.text(title, 14, currentY);
      currentY += 6;
      
      const content = (contentArray && contentArray.length > 0) ? contentArray.join("\n") : "None";
      
      doc.setFontSize(11);
      doc.setTextColor(80);
      const splitText = doc.splitTextToSize(content, 180);
      doc.text(splitText, 14, currentY);
      
      currentY += (splitText.length * 5) + 10;
    };

    renderSection("Tasks Completed", report.tasksCompleted);
    renderSection("Tasks Planned for Next Week", report.tasksPlanned);
    renderSection("Blockers / Challenges", report.blockers);

    if (report.notes) {
      renderSection("Notes", [report.notes]);
    }

    doc.save(`Weekly_Report_${report.user?.name || 'Unknown'}_${weekRangeDisplay}.pdf`);
  };

  return (
    <DashboardLayout activeItem="dashboard" title="Manager Dashboard" subtitle="Overview of team reports and performance.">
      <div className="manager-dashboard-container">
        
        <div className="filters-section">
          <div className="filter-group">
            <label>Member Name</label>
            <input type="text" placeholder="Filter by member..." value={filter.member} onChange={(e) => setFilter({...filter, member: e.target.value})} />
          </div>
          <div className="filter-group">
            <label>Project</label>
            <input type="text" placeholder="Filter by project..." value={filter.project} onChange={(e) => setFilter({...filter, project: e.target.value})} />
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select value={filter.status} onChange={(e) => setFilter({...filter, status: e.target.value})}>
              <option value="">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="PENDING">Pending</option>
              <option value="LATE">Late</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Start Date</label>
            <input type="date" value={filter.startDate} onChange={(e) => setFilter({...filter, startDate: e.target.value})} />
          </div>
          <div className="filter-group">
            <label>End Date</label>
            <input type="date" value={filter.endDate} onChange={(e) => setFilter({...filter, endDate: e.target.value})} />
          </div>
          <div className="filter-group filter-group--action">
            <button 
              onClick={handleClearFilters}
              className="filter-clear-btn"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="table-responsive table-responsive--stacked">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Project</th>
                <th>Week</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "32px" }}>Loading reports...</td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "32px" }}>No reports found matching your filters.</td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report._id}>
                    <td className="fw-medium" data-label="Member">{report.user?.name || "Unknown"}</td>
                    <td data-label="Project">{report.project?.name || "N/A"}</td>
                    <td data-label="Week">{report.weekStart ? formatDate(report.weekStart) : "-"}</td>
                    <td data-label="Status">
                      <span className={`status-badge status-${(report.status || "DRAFT").toLowerCase()}`}>
                        {report.status === "SUBMITTED" ? "Submitted" : report.status === "LATE" ? "Late" : report.status === "PENDING" ? "Pending" : "Draft"}
                      </span>
                    </td>
                    <td data-label="Date">{formatDate(report.createdAt)}</td>
                    <td data-label="Actions">
                      <div className="table-actions">
                        <Link to={`/reports/${report._id}`} className="action-link view">Review</Link>
                        <button 
                          onClick={() => handleDownloadPDF(report)} 
                          className="download-btn" 
                          title="Download PDF"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>download</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
