import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getMyReports } from "../../services/reportService";
import { getProjects } from "../../services/projectService";
import { useAuth } from "../../hooks/useAuth";
import jsPDF from "jspdf";
import "./MyReports.css";

const MyReports = () => {
  const { user: currentUser } = useAuth();
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [repRes, projRes] = await Promise.all([
          getMyReports(),
          getProjects()
        ]);
        setReports(repRes.reports || []);
        setProjects(projRes.projects || []);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleDownloadPDF = (report) => {
    const doc = new jsPDF();
    const weekRangeDisplay = report.weekStart ? formatDate(report.weekStart) : "Unknown Week";
    const displayStatus = report.status === "SUBMITTED" ? "Submitted" : "Draft";
    
    doc.setFontSize(20);
    doc.text("Weekly Report", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Date Range: ${weekRangeDisplay}`, 14, 32);
    doc.text(`Member: ${currentUser?.name || "Unknown"}`, 14, 38);
    doc.text(`Project: ${report.project?.name || report.project || "N/A"}`, 14, 44);
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

    doc.save(`Weekly_Report_${currentUser?.name || 'User'}_${weekRangeDisplay}.pdf`);
  };

  const filteredReports = reports.filter((report) => {
    const reportProjId = report.project?._id || report.project || "";
    const matchesProject = projectFilter ? reportProjId.toString() === projectFilter.toString() : true;
    
    const matchesStatus = statusFilter ? report.status === statusFilter : true;
    
    const combinedText = [
      ...(report.tasksCompleted || []),
      ...(report.tasksPlanned || []),
      ...(report.blockers || []),
      report.notes || ""
    ].join(" ").toLowerCase();
    
    const matchesSearch = searchTerm ? combinedText.includes(searchTerm.toLowerCase()) : true;
    
    return matchesProject && matchesStatus && matchesSearch;
  });

  return (
    <DashboardLayout activeItem="history" title="My Reports History" subtitle="View and search your past submissions and drafts.">
      <div className="reports-history-container">
        
        <div className="filters-panel">
          <div className="filters-panel__group">
            <label htmlFor="search" className="filters-panel__label">Search Keywords</label>
            <input
              type="text"
              id="search"
              placeholder="Search tasks, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filters-panel__input"
            />
          </div>

          <div className="filters-panel__group filters-panel__group--fixed">
            <label htmlFor="statusFilter" className="filters-panel__label">Status</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filters-panel__select"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
            </select>
          </div>

          <div className="filters-panel__group filters-panel__group--fixed">
            <label htmlFor="projectFilter" className="filters-panel__label">Project</label>
            <select
              id="projectFilter"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="filters-panel__select"
            >
              <option value="">All Projects</option>
              {projects.map((proj) => (
                <option key={proj._id} value={proj._id}>{proj.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-responsive table-responsive--stacked">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Week Range</th>
                <th>Project</th>
                <th>Hours Worked</th>
                <th>Status</th>
                <th>Date Saved</th>
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
                  <td colSpan="6" style={{ textAlign: "center", padding: "32px" }}>No reports match your filters.</td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report._id}>
                    <td className="fw-medium" data-label="Week Range">{report.weekStart ? formatDate(report.weekStart) : "Unknown Week"}</td>
                    <td data-label="Project">{report.project?.name || report.project || "N/A"}</td>
                    <td data-label="Hours Worked">{report.hoursWorked || 0} hrs</td>
                    <td data-label="Status">
                      <span className={`status-badge status-${(report.status || "DRAFT").toLowerCase()}`}>
                        {report.status === "SUBMITTED" ? "Submitted" : "Draft"}
                      </span>
                    </td>
                    <td data-label="Date Saved">{formatDate(report.createdAt)}</td>
                    <td data-label="Actions">
                      <div className="action-links" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <Link to={`/reports/${report._id}`} className="action-link view">View</Link>
                        {report.status !== "SUBMITTED" && (
                          <Link to={`/reports/edit/${report._id}`} className="action-link edit" style={{ color: "var(--color-primary)" }}>Edit</Link>
                        )}
                        <button 
                          onClick={() => handleDownloadPDF(report)}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "var(--color-outline)", display: "inline-flex", alignItems: "center"
                          }}
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

export default MyReports;
