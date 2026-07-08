import React, { useState, useEffect } from "react";
import Button from "../common/Button";
import { Link } from "react-router-dom";
import { getMyReports } from "../../services/reportService";
import "./RecentReports.css";

const RecentReports = ({ initialReports }) => {
  const [reports, setReports] = useState(initialReports || []);
  const [loading, setLoading] = useState(!initialReports);

  useEffect(() => {
    if (initialReports) {
      setReports(initialReports);
      setLoading(false);
      return;
    }
    
    const fetchReports = async () => {
      try {
        const response = await getMyReports();
        setReports((response.reports || []).slice(0, 3));
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [initialReports]);

  const formatDateRange = (dateString) => {
    if (!dateString) return "-";
    const start = new Date(dateString);
    const end = new Date(start);
    end.setDate(end.getDate() + 4);
    const options = { month: "short", day: "numeric" };
    return `${start.toLocaleDateString("en-US", options)} - ${end.toLocaleDateString("en-US", options)}`;
  };

  return (
    <section className="recent-reports" aria-labelledby="recent-reports-title">
      <div className="recent-reports__header">
        <h3 className="recent-reports__title" id="recent-reports-title">
          Recent Reports
        </h3>
        <Link to="/reports/history" style={{textDecoration: 'none'}}>
          <Button variant="ghost" className="recent-reports__view-all">
            View All
            <span className="material-symbols-outlined">chevron_right</span>
          </Button>
        </Link>
      </div>

      <div className="recent-reports__list">
        {loading ? (
          <p style={{ padding: "16px", color: "var(--text-secondary)" }}>Loading recent reports...</p>
        ) : reports.length === 0 ? (
          <p style={{ padding: "16px", color: "var(--text-secondary)" }}>No recent reports.</p>
        ) : (
          reports.map((report) => (
            <article className="recent-reports__item" key={report._id}>
              <div className="recent-reports__week">
                <div className="recent-reports__date-icon">
                  <span className="material-symbols-outlined">calendar_month</span>
                </div>
                <div>
                  <p className="recent-reports__week-title">Weekly Report</p>
                  <p className="recent-reports__muted">{report.weekStart ? formatDateRange(report.weekStart) : "Recent"}</p>
                </div>
              </div>

              <div className="recent-reports__project">
                <p className="recent-reports__label">Project</p>
                <p className="recent-reports__strong">{report.project?.name || "N/A"}</p>
              </div>

              <div className="recent-reports__status">
                <p className="recent-reports__label">Status</p>
                <p className="recent-reports__status-line">
                  <span
                    className={`recent-reports__status-dot recent-reports__status-dot--${report.status === 'SUBMITTED' ? 'approved' : 'review'}`}
                  />
                  <span className="recent-reports__strong">{report.status === 'SUBMITTED' ? 'Submitted' : 'Draft'}</span>
                </p>
              </div>

              <div className="recent-reports__action">
                <Link to={`/reports/${report._id}`}>
                  <Button iconOnly ariaLabel={`View report`}>
                    <span className="material-symbols-outlined">visibility</span>
                  </Button>
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
};

export default RecentReports;
