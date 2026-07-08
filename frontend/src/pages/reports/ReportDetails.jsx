import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getReportById } from "../../services/reportService";
import { useAuth } from "../../hooks/useAuth";
import jsPDF from "jspdf";
import "./ReportDetails.css";

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await getReportById(id);
        setReport(response.report);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (loading) {
    return (
      <DashboardLayout activeItem="reports" title="Loading..." subtitle="Fetching report details.">
        <div style={{ padding: "32px", textAlign: "center" }}>Loading...</div>
      </DashboardLayout>
    );
  }

  if (!report) {
    return (
      <DashboardLayout activeItem="reports" title="Not Found" subtitle="Report could not be found.">
        <div style={{ padding: "32px", textAlign: "center" }}>Report not found.</div>
      </DashboardLayout>
    );
  }

  const weekRangeDisplay = report.weekStart ? formatDate(report.weekStart) : "Unknown Week";
  const displayStatus = report.status === "SUBMITTED" ? "Submitted" : report.status === "LATE" ? "Late" : report.status === "PENDING" ? "Pending" : "Draft";

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
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
    <DashboardLayout activeItem="reports" title={`Report Details - ${weekRangeDisplay}`} subtitle="Viewing submission details.">
      <div className="report-details-container">
        <header className="report-header">
          <div className="report-meta">
            <span className="meta-item"><span className="material-symbols-outlined">calendar_month</span> {weekRangeDisplay}</span>
            <span className="meta-item"><span className="material-symbols-outlined">folder</span> {report.project?.name || "N/A"}</span>
            <span className="meta-item"><span className="material-symbols-outlined">schedule</span> {report.hoursWorked || 0} Hours</span>
            <span className="meta-item"><span className="material-symbols-outlined">person</span> {report.user?.name || "Unknown"}</span>
          </div>
          <div className="report-header-actions">
            <span className={`status-badge status-${(report.status || "DRAFT").toLowerCase()}`}>{displayStatus}</span>
            <button 
              onClick={handleDownloadPDF}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "6px 12px", borderRadius: "6px",
                backgroundColor: "var(--color-primary)", color: "white",
                border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "500"
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>download</span>
              PDF
            </button>
          </div>
        </header>

        <div className="report-sections">
          <div className="report-section">
            <h3>Tasks Completed</h3>
            <p className="report-text" style={{ whiteSpace: "pre-wrap" }}>{report.tasksCompleted?.join("\n") || "None"}</p>
          </div>
          
          <div className="report-section">
            <h3>Tasks Planned for Next Week</h3>
            <p className="report-text" style={{ whiteSpace: "pre-wrap" }}>{report.tasksPlanned?.join("\n") || "None"}</p>
          </div>
          
          <div className="report-section">
            <h3>Blockers / Challenges</h3>
            <p className="report-text" style={{ whiteSpace: "pre-wrap" }}>{report.blockers?.join("\n") || "None"}</p>
          </div>
          
          {report.notes && (
            <div className="report-section">
              <h3>Notes / Links</h3>
              <p className="report-text" style={{ whiteSpace: "pre-wrap" }}>{report.notes}</p>
            </div>
          )}
        </div>

        <div className="report-actions">
          <button onClick={() => navigate(-1)} className="back-link" style={{ background: "none", border: "none", cursor: "pointer" }}>
            <span className="material-symbols-outlined">arrow_back</span>
            Back
          </button>
          {report.status !== "SUBMITTED" && user?.role === "TEAM_MEMBER" && (
             <Link to={`/reports/edit/${report._id}`} className="edit-link">
               <span className="material-symbols-outlined">edit</span>
               Edit Draft
             </Link>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportDetails;
