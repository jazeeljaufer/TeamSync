import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import { getReportById, updateReport, submitReport } from "../../services/reportService";
import { getProjects } from "../../services/projectService";
import "./CreateReport.css";

const getWeekStartEnd = (dateStr) => {
  const current = new Date(dateStr);
  const day = current.getDay();
  const diff = current.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(current.setDate(diff));
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const EditReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState("");
  const [formData, setFormData] = useState({
    project: "",
    tasksCompleted: "",
    tasksPlanned: "",
    blockers: "",
    hoursWorked: "",
    notes: "",
  });

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, reportRes] = await Promise.all([
          getProjects(),
          getReportById(id)
        ]);

        setProjects(projRes.projects || []);

        const rep = reportRes.report;
        if (!rep) {
          throw new Error("Report not found.");
        }

        if (rep.status === "SUBMITTED") {
          setStatus({ type: "error", message: "Submitted reports cannot be edited." });
          setTimeout(() => navigate(`/reports/${id}`), 2000);
          return;
        }

        setFormData({
          project: rep.project?._id || rep.project || "",
          tasksCompleted: (rep.tasksCompleted || []).join("\n"),
          tasksPlanned: (rep.tasksPlanned || []).join("\n"),
          blockers: (rep.blockers || []).join("\n"),
          hoursWorked: rep.hoursWorked || "",
          notes: rep.notes || "",
        });

        if (rep.weekStart) {
          setSelectedDate(new Date(rep.weekStart).toISOString().split("T")[0]);
        }
      } catch (error) {
        setStatus({ type: "error", message: error.message || "Failed to load report data." });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAction = async (action) => {
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });
    try {
      const { start, end } = getWeekStartEnd(selectedDate);
      
      const payload = {
        weekStart: start,
        weekEnd: end,
        project: formData.project,
        tasksCompleted: formData.tasksCompleted.split("\n").map(t => t.trim()).filter(Boolean),
        tasksPlanned: formData.tasksPlanned.split("\n").map(t => t.trim()).filter(Boolean),
        blockers: formData.blockers.split("\n").map(b => b.trim()).filter(Boolean),
        hoursWorked: formData.hoursWorked ? Number(formData.hoursWorked) : 0,
        notes: formData.notes,
        status: "DRAFT"
      };

      if (!payload.project) {
        throw new Error("Please select a project.");
      }
      if (payload.tasksCompleted.length === 0) {
        throw new Error("Please list at least one completed task (separated by newlines).");
      }
      if (payload.tasksPlanned.length === 0) {
        throw new Error("Please list at least one planned task (separated by newlines).");
      }

      await updateReport(id, payload);

      if (action === 'submitted') {
        await submitReport(id);
      }

      setStatus({ 
        type: "success", 
        message: `Report ${action === 'submitted' ? 'submitted' : 'updated'} successfully.` 
      });
      
      setTimeout(() => navigate("/reports/history"), 1500);
    } catch (e) {
      setStatus({ type: "error", message: e.message || `Failed to ${action} report.` });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeItem="reports" title="Edit Weekly Report" subtitle="Loading report...">
        <div style={{ padding: "32px", textAlign: "center" }}>Loading report details...</div>
      </DashboardLayout>
    );
  }

  const { start, end } = selectedDate ? getWeekStartEnd(selectedDate) : { start: null, end: null };
  const dateRangeDisplay = start && end ? `${start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} - ${end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}` : "";

  return (
    <DashboardLayout 
      activeItem="reports" 
      title="Edit Weekly Report" 
      subtitle="Update the draft details of your report."
    >
      <div className="create-report-container">
        <form className="create-report-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="selectedDate">Select Week Day</label>
              <input
                type="date"
                id="selectedDate"
                name="selectedDate"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid var(--color-outline-variant)', 
                  borderRadius: '8px', 
                  backgroundColor: 'var(--color-surface)', 
                  color: 'var(--color-on-background)' 
                }}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="project">Project / Category</label>
              <select 
                id="project" 
                name="project" 
                value={formData.project} 
                onChange={handleChange}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid var(--color-outline-variant)', 
                  borderRadius: '8px', 
                  backgroundColor: 'var(--color-surface)', 
                  color: 'var(--color-on-background)' 
                }}
              >
                <option value="">Select a project...</option>
                {projects.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {dateRangeDisplay && (
            <div style={{ margin: "8px 0 16px", color: "var(--color-primary)", fontWeight: "600" }}>
              Calculated Week: {dateRangeDisplay}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="tasksCompleted">Tasks Completed (One task per line)</label>
            <textarea 
              id="tasksCompleted" 
              name="tasksCompleted" 
              placeholder="List the tasks you finished this week..." 
              value={formData.tasksCompleted} 
              onChange={handleChange} 
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--color-outline-variant)',
                borderRadius: '8px',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-on-background)',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tasksPlanned">Tasks Planned for Next Week (One task per line)</label>
            <textarea 
              id="tasksPlanned" 
              name="tasksPlanned" 
              placeholder="What are you planning to work on next week?" 
              value={formData.tasksPlanned} 
              onChange={handleChange} 
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--color-outline-variant)',
                borderRadius: '8px',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-on-background)',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="blockers">Blockers / Challenges (Optional, one per line)</label>
            <textarea 
              id="blockers" 
              name="blockers" 
              placeholder="Any issues preventing your progress?" 
              value={formData.blockers} 
              onChange={handleChange} 
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--color-outline-variant)',
                borderRadius: '8px',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-on-background)',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div className="form-row">
            <InputField 
              id="hoursWorked" 
              name="hoursWorked" 
              label="Hours Worked (Optional)" 
              type="number" 
              placeholder="e.g., 40" 
              value={formData.hoursWorked} 
              onChange={handleChange} 
              required={false} 
            />
            <InputField 
              id="notes" 
              name="notes" 
              label="Notes / Links (Optional)" 
              type="text" 
              placeholder="Additional info or links" 
              value={formData.notes} 
              onChange={handleChange} 
              required={false} 
            />
          </div>

          {status.message && (
             <div className={`status-message status-message--${status.type}`} style={{ margin: '16px 0', padding: '12px', borderRadius: '8px', backgroundColor: status.type === 'error' ? 'var(--color-error-container)' : 'var(--color-secondary-container)', color: status.type === 'error' ? 'var(--color-on-error-container)' : 'var(--color-primary)' }}>
               {status.message}
             </div>
          )}

          <div className="form-actions" style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
            <Button variant="outline" onClick={() => handleAction('draft')} disabled={isSubmitting}>Update Draft</Button>
            <Button onClick={() => handleAction('submitted')} loading={isSubmitting}>Submit Report</Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default EditReport;
